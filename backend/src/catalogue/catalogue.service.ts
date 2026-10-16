import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { categoriesForFilterGroup, FilterCategory } from "../common/constants/filter-category.constant";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';

// How much weight the user's own wardrobe photos get vs their stated onboarding preferences
// when combining them into one profile vector. Wardrobe photos are a stronger, more concrete
// signal (what the user actually owns and wears) than self-reported preference keywords.
const WARDROBE_WEIGHT = 0.6;
const PREFERENCE_WEIGHT = 0.4;

interface OnboardingPreferences {
    primary_aesthetic: string | null;
    style_keywords: string[];
    colour_preferences: string[];
    fashion_outlook: string[];
    style_no_gos: string[];
}

@Injectable()
export class CatalogueService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getCatalogueReccomendations(user_id: string, limit: number, offset: number, category?: FilterCategory) {
        const supabase = this.supabaseService.client;

        const profile_id = await this.get_profile_id(user_id);
        const onboarding = await this.get_onboarding(user_id);
        const match_categories = category ? categoriesForFilterGroup(category) : null;

        // items already on the user's wishlist are not reccomended again
        const { data: wishlist, error: wishlist_error } = await supabase.from('wishlist')
                                                                        .select('catalogue_item_id')
                                                                        .eq('user_id', profile_id);

        if(wishlist_error){
            throw new HttpException(wishlist_error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const exclude_ids: string[] = wishlist.map(row => row.catalogue_item_id).filter(Boolean);
        const exclude_styles = onboarding?.style_no_gos?.map(s => s.toLowerCase()).filter(Boolean) ?? [];

        // combines the user's wardrobe photos + onboarding preferences into one vector, in the
        // same embedding space as catalogue items; null for a brand new user or if ml-service
        // can't be reached, in which case we fall back to the pre-similarity-search behaviour
        const profile_vector = await this.buildUserProfileVector(profile_id, onboarding);

        if (profile_vector) {
            const { data, error } = await supabase.rpc('match_catalogue_items', {
                query_embedding: profile_vector,
                match_categories,
                exclude_styles,
                exclude_ids,
                match_limit: limit,
                match_offset: offset,
            });

            if (error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (data.length === 0) {
                throw new NotFoundException('No reccomended catalogue items found.');
            }

            return data;
        }

        return this.getFallbackRecommendations(match_categories, exclude_styles, exclude_ids, limit, offset);
    }

    // Cold start (no wardrobe items or onboarding answers yet) or the ML service is down:
    // catalogue items in a fixed order, same behaviour as before similarity search existed.
    private async getFallbackRecommendations(
        match_categories: string[] | null,
        exclude_styles: string[],
        exclude_ids: string[],
        limit: number,
        offset: number,
    ) {
        const supabase = this.supabaseService.client;

        // include each item's brand (left join so items without a brand are still returned)
        let query = supabase.from('catalogue_items').select('*, brands (*)');

        if (match_categories) {
            const category_query = match_categories.map((item) => `category.ilike.${item}`).join(',');
            query = query.or(category_query);
        }

        if (exclude_ids.length !== 0) {
            query = query.not('id', 'in', `(${exclude_ids.join(',')})`);
        }

        if (exclude_styles.length !== 0) {
            query = query.not('style', 'ov', `{${exclude_styles.join(',')}}`);
        }

        // a stable order so each page (offset) continues where the last one ended
        const { data, error } = await query.order('created_at', { ascending: true })
                                           .order('id', { ascending: true })
                                           .range(offset, offset + limit - 1);

        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(data.length === 0){
            throw new NotFoundException('No reccomended catalogue items found.');
        }

        return data;
    }

    private async buildUserProfileVector(
        profile_id: string,
        onboarding: OnboardingPreferences | null,
    ): Promise<number[] | null> {
        try {
            const wardrobe_vector = await this.getWardrobeAverageEmbedding(profile_id);
            const preference_vector = await this.getPreferenceTextEmbedding(onboarding);

            if (wardrobe_vector && preference_vector) {
                return this.normalise(
                    this.addScaled(wardrobe_vector, WARDROBE_WEIGHT, preference_vector, PREFERENCE_WEIGHT),
                );
            }

            return wardrobe_vector ?? preference_vector ?? null;
        } catch {
            // ml-service unreachable, or a malformed response - personalise on a best-effort
            // basis rather than failing the whole recommendations request
            return null;
        }
    }

    private async getWardrobeAverageEmbedding(profile_id: string): Promise<number[] | null> {
        const supabase = this.supabaseService.client;

        const { data, error } = await supabase.from('wardrobe_items')
                                              .select('embedding')
                                              .eq('user_id', profile_id)
                                              .not('embedding', 'is', null);

        if (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // pgvector columns come back from PostgREST as strings like "[0.1,0.2,...]", not arrays,
        // so parse them before doing maths on them (otherwise every component becomes NaN)
        const embeddings = (data as { embedding: number[] | string }[])
            .map((row) => (typeof row.embedding === 'string' ? (JSON.parse(row.embedding) as number[]) : row.embedding))
            .filter(Boolean);
        if (embeddings.length === 0) {
            return null;
        }

        return this.normalise(this.averageVectors(embeddings));
    }

    private async getPreferenceTextEmbedding(onboarding: OnboardingPreferences | null): Promise<number[] | null> {
        if (!onboarding) {
            return null;
        }

        // style_no_gos is used as a hard exclusion filter instead, not a positive preference
        const texts = [
            onboarding.primary_aesthetic,
            ...(onboarding.style_keywords ?? []),
            ...(onboarding.colour_preferences ?? []),
            ...(onboarding.fashion_outlook ?? []),
        ].filter((text): text is string => !!text && text.trim().length !== 0);

        if (texts.length === 0) {
            return null;
        }

        let res: Response;
        try {
            res = await fetch(`${ML_SERVICE_URL}/embed-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts }),
            });
        } catch {
            throw new HttpException('ML service unavailable', HttpStatus.BAD_GATEWAY);
        }

        if (!res.ok) {
            throw new HttpException('ML service failed to embed preferences', HttpStatus.BAD_GATEWAY);
        }

        const { embedding } = (await res.json()) as { embedding: number[] };
        return embedding;
    }

    // onboarding.user_id is auth.users.id, not profiles.id (see baseline_onboarding_schema migration),
    // so this is looked up with the auth id rather than the profile id used everywhere else here
    private async get_onboarding(auth_id: string): Promise<OnboardingPreferences | null> {
        const supabase = this.supabaseService.client;

        const { data, error } = await supabase.from('onboarding')
                                              .select('primary_aesthetic, style_keywords, colour_preferences, fashion_outlook, style_no_gos')
                                              .eq('user_id', auth_id);

        if (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return (data[0] as OnboardingPreferences | undefined) ?? null;
    }

    private averageVectors(vectors: number[][]): number[] {
        const length = vectors[0].length;
        const sum = Array.from<number>({ length }).fill(0);
        for (const vector of vectors) {
            for (let i = 0; i < length; i++) {
                sum[i] += vector[i];
            }
        }
        return sum.map((value) => value / vectors.length);
    }

    private addScaled(a: number[], weight_a: number, b: number[], weight_b: number): number[] {
        return a.map((value, i) => value * weight_a + b[i] * weight_b);
    }

    private normalise(vector: number[]): number[] {
        const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
        return magnitude === 0 ? vector : vector.map((value) => value / magnitude);
    }

    private async get_profile_id(user_id: string){
        const supabase = this.supabaseService.client;

        const { data, error } = await supabase.from('profiles')
                                              .select('id')
                                              .eq('user_id', user_id);

        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no user throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No user found');
        }

        return data[0].id;
    }

    async searchCatalogueItems(
        item_name?: string,
        clothingcategory?: string[],
        style?: string[],
        brand?: string[],
        size?: string[],
        colour?: string[],
        material?: string[],
        min_price?: number,
        max_price?: number
    ) {
        const supabase = this.supabaseService.client;

        let query = supabase.from('catalogue_items')
                            .select('*, brands!inner (*)');

        if(item_name && item_name?.length !== 0){
            query = query.ilike('item_name', `%${item_name}%`);
        }

        if(clothingcategory && clothingcategory?.length !== 0){
            const clothingcategory_query = clothingcategory.map(item => `category.ilike.${item}`).join(',');
            query = query.or(clothingcategory_query);
        }

        if(style && style?.length !== 0){
            style = style.map((item) => item.toLowerCase());
            query= query.overlaps('style', style);
        }

        if(brand && brand?.length !== 0){
            const brand_query = brand.map(item => `brand_name.ilike.${item}`).join(',');
            query = query.or(brand_query, { referencedTable: 'brands' });
        }

        if(size && size?.length !== 0){
            const sizes = this.mapSizeOptions(size.at(0) ?? "error");
            query = query.overlaps('available_sizes', sizes);
        }

        if(colour && colour?.length !== 0){
            colour = colour.map((item) => item.toLowerCase());
            query= query.overlaps('colour', colour);
        }

        if(material && material?.length !== 0){
            material = material.map((item) => item.toLowerCase());
            query= query.overlaps('materials', material);
        }

        if(max_price && max_price > 0){
            if(min_price){
                // finds rows where value is less than or equal to max price
                query = query.lte('price', max_price);

                // finds rows where value is greater than or equal to min price
                query = query.gte('price', min_price);
            }
            else {
                // if no min price assume min price as 0 therefore no need to set greater than
                query = query.lte('price', max_price);
            }
        }

        // find any items in catalogue that match
        const { data, error } = await query.limit(10);

        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no item throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No items found matching criteria');
        }

        // if yes return all matching items
        return data;
    }

    async getCatalogueItem(id: string){
        const supabase = this.supabaseService.client;

        // get item by id, with its brand (left join so items without a brand are still returned)
        const { data, error } = await supabase.from('catalogue_items')
                                                .select('*, brands (*)')
                                                .eq('id', id);

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no item throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No item found with provided item id');
        }

        // otherwise item
        return data;
    }

    private mapSizeOptions(size: string){
        // go through possible size searchs (3XS, 2XS, XS, S, M, L, XL, 2XL, 3XL)

        switch (size) {
            case '3XS':
                return ['3XS', '4', 'One Size', 'XXXS', '22'];
            case '2XS':
                return ['2XS', '6', 'One Size', 'XXS', '24'];
            case 'XS':
                return ['XS', '8', 'One Size', 'Extra Small', '26', 'XS/S'];
            case 'S':
                return ['S', '10', 'One Size', 'Small', '28', 'XS/S'];
            case 'M':
                return ['M', '12', 'One Size', 'Medium', '30', 'M/L'];
            case 'L':
                return ['L', '14', 'One Size', 'Large', '32', 'M/L'];
            case 'XL':
                return ['XL', '16', 'One Size', 'Extra Large', '34'];
            case '2XL':
                return ['2XL', '18', 'One Size', 'XXL', '36'];
            case '3XL':
                return ['3XL', '20', 'One Size', 'XXXL', '38'];
            default:
                throw new BadRequestException("Invalid size request");
        }
    }
}
