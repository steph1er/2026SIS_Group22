import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FilterCategory,
  resolveFilterGroup,
} from '../common/constants/filter-category.constant';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOutfitItemDto } from './dto/create-outfit-item.dto';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';
import { OutfitBuilderTab } from './interfaces/outfit-builder-tab.interface';
import { OutfitWithItems } from './interfaces/outfit-with-item.interface';
import { Outfit } from './interfaces/outfit.interface';

type OutfitUpdateFields = Partial<
  Pick<Outfit, 'name' | 'occasion' | 'style' | 'season'>
>;

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';
const MAX_RECOMMENDATIONS = 5;

interface ProfileVectorWeights {
  wardrobe: number;
  preference: number;
}

const DEFAULT_WEIGHTS: ProfileVectorWeights = {
  wardrobe: 0.6,
  preference: 0.4,
};
const WARDROBE_WEIGHTS: ProfileVectorWeights = {
  wardrobe: 0.2,
  preference: 0.8,
};

interface OnboardingPreferences {
  primary_aesthetic: string | null;
  style_keywords: string[];
  colour_preferences: string[];
}

const STYLE_PHRASES: Record<string, string> = {
  grunge:
    'grunge style clothing, distressed, graphic prints, alternative, oversized, dark tones',
  edgy: 'edgy alternative style clothing, dark, leather, graphic prints',
  minimalist: 'minimalist clothing, clean lines, neutral tones, simple',
  streetwear:
    'streetwear clothing, oversized, graphic prints, hoodies, sneakers, jeans',
  cottagecore:
    'cottagecore clothing, floral prints, puff sleeves, linen, soft pastel dresses',
  'dark academia':
    'dark academia clothing, tweed blazers, plaid, knit sweaters, brown and dark green tones',
  coquette: 'coquette style clothing, lace, bows, ribbons, soft pink',
  bohemian: 'bohemian clothing, flowy, earthy tones, fringe, crochet, paisley',
  preppy:
    'preppy clothing, polo shirts, pleated skirts, cardigans, collars, navy and white',
  athleisure:
    'athleisure clothing, activewear, leggings, joggers, sporty, stretch fabric',
  'old money':
    'old money style clothing, tailored, cashmere knitwear, polo shirts, navy and neutral tones',
  'avant-garde':
    'avant-garde clothing, experimental silhouettes, asymmetric, sculptural, unconventional',
  romantic:
    'romantic style clothing, soft flowing fabrics, ruffles, lace, floral, pastel',
  retro:
    'retro vintage style clothing, 70s and 90s inspired, bold patterns, high-waisted, denim',
};

const COLOUR_PHRASES: Record<string, string> = {
  mono: 'monochrome clothing in black, white, grey, single colour',
  neutrals:
    'neutral coloured clothing in beige, cream, tan, white, grey, black, brown',
  pastels:
    'pastel coloured clothing in soft pink, baby blue, lavender, light orange, light yellow, and mint',
  earth:
    'earth tone clothing in brown, dark green, rust, terracotta, khaki, olive green',
  bold: 'bold bright coloured clothing in vivid red, orange, cobalt blue, hot pink, bright yellow, bright green',
};

@Injectable()
export class OutfitsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOutfits(auth_id: string): Promise<OutfitWithItems[]> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('outfits')
      .select('*, outfit_items(*, wardrobe_items(*), catalogue_items(*))')
      .eq('user_id', auth_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (data.length === 0) {
      throw new NotFoundException('No outfits found for current user');
    }

    return data;
  }

  async getOutfit(id: string, auth_id: string): Promise<OutfitWithItems> {
    const supabase = this.supabaseService.client;

    //return as a single object rather than array
    const { data, error } = await supabase
      .from('outfits')
      .select('*, outfit_items(*)')
      .eq('id', id)
      .eq('user_id', auth_id)
      .maybeSingle();

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!data) {
      throw new NotFoundException(
        'No outfit found for specified outfit id for current user',
      );
    }

    return data;
  }

  //gets recommended and all other wardrobe items for outfit-builder page
  async getWardrobeForBuilder(
    filter_category: FilterCategory = 'tops',
    auth_id: string,
  ): Promise<OutfitBuilderTab> {
    const supabase = this.supabaseService.client;

    const profile_id = await this.get_profile_id(auth_id);

    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', profile_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //filter data according to provided filter category, otherwise default is 'tops'
    const filtered = (data ?? []).filter(
      (item) => resolveFilterGroup(item.clothing_category) === filter_category,
    );

    const profileVector =
      filtered.length === 0
        ? null
        : await this.buildProfileVector(auth_id, profile_id, WARDROBE_WEIGHTS);

    // return this.recommendationsAndItems(filtered);
    return this.recommendationsAndItems(filtered, profileVector);
  }

  //gets recommended and all other wishlist items for outfit-builder page
  async getWishlistForBuilder(
    filter_category: FilterCategory = 'tops',
    auth_id: string,
  ): Promise<OutfitBuilderTab> {
    const supabase = this.supabaseService.client;

    const profile_id = await this.get_profile_id(auth_id);

    const { data, error } = await supabase
      .from('wishlist')
      .select('id, catalogue_items!inner(*)')
      .eq('user_id', profile_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const wishlistItems = (data ?? []).map((row: any) => ({
      wishlist_id: row.id,
      ...row.catalogue_items,
    }));

    const filtered = wishlistItems.filter(
      (item) => resolveFilterGroup(item.category) === filter_category,
    );

    const profileVector =
      filtered.length === 0
        ? null
        : await this.buildProfileVector(auth_id, profile_id);

    // return this.recommendationsAndItems(filtered);
    return this.recommendationsAndItems(filtered, profileVector);
  }

  async createOutfit(
    createOutfitDto: CreateOutfitDto,
    auth_id: string,
  ): Promise<OutfitWithItems> {
    const supabase = this.supabaseService.client;

    const { name, occasion, style, season, items } = createOutfitDto;

    //verify any wardrobe items belong to user and catalogue items exist
    await this.verify_items(auth_id, items);

    //check each item is either a wardrobe or catalogue item
    await this.validateItemSource(items);

    const outfitName = name?.trim() || 'My Outfit';

    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .insert({ user_id: auth_id, name: outfitName, occasion, style, season })
      .select()
      .single();

    if (outfitError) {
      throw new HttpException(
        outfitError.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    //add the outfit items to outfit_items
    const outfitItemsData = items.map((item) => ({
      outfit_id: outfit.id,
      wardrobe_items_id: item.wardrobe_items_id ?? null,
      catalogue_items_id: item.catalogue_items_id ?? null,
    }));

    const { data: outfitItems, error: itemsError } = await supabase
      .from('outfit_items')
      .insert(outfitItemsData)
      .select();

    if (itemsError) {
      //delete the outfit if its items failed to save
      await supabase.from('outfits').delete().eq('id', outfit.id);
      throw new HttpException(
        itemsError.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { ...outfit, outfit_items: outfitItems };
  }

  async updateOutfit(
    id: string,
    updateOutfitDto: UpdateOutfitDto,
    auth_id: string,
  ): Promise<OutfitWithItems> {
    const supabase = this.supabaseService.client;

    //verify outfit exists and belongs to user
    await this.check_outfit_belongs_to_user(auth_id, id);

    const { name, occasion, style, season, items } = updateOutfitDto;

    const updateFields: OutfitUpdateFields = {};
    if (name !== undefined) {
      updateFields.name = name;
    }
    if (occasion !== undefined) {
      updateFields.occasion = occasion;
    }
    if (style !== undefined) {
      updateFields.style = style;
    }
    if (season !== undefined) {
      updateFields.season = season;
    }

    if (Object.keys(updateFields).length > 0) {
      const { error: updateError } = await supabase
        .from('outfits')
        .update(updateFields)
        .eq('id', id);

      if (updateError) {
        throw new HttpException(
          updateError.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    if (items !== undefined) {
      await this.verify_items(auth_id, items);

      await this.validateItemSource(items);

      //replace entire outfit items list if items are updated
      const { error: deleteError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', id);

      if (deleteError) {
        throw new HttpException(
          deleteError.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const updateOutfitItems = items.map((item) => ({
        outfit_id: id,
        wardrobe_items_id: item.wardrobe_items_id ?? null,
        catalogue_items_id: item.catalogue_items_id ?? null,
      }));

      const { error: insertError } = await supabase
        .from('outfit_items')
        .insert(updateOutfitItems);

      if (insertError) {
        throw new HttpException(
          insertError.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return this.getOutfit(id, auth_id);
  }

  async deleteOutfit(id: string, auth_id: string): Promise<void> {
    const supabase = this.supabaseService.client;

    await this.check_outfit_belongs_to_user(auth_id, id);

    const { error } = await supabase.from('outfits').delete().eq('id', id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // wardrobe recommendations lean more on items similar to onboarding preferences
  // wishlist recommendations lean more on items similar to wardrobe items
  private recommendationsAndItems<
    T extends { id: string; embedding?: number[] | string | null },
  >(
    items: T[],
    profileVector: number[] | null,
  ): OutfitBuilderTab<Omit<T, 'embedding'>> {
    const stripEmbedding = ({ embedding, ...rest }: T) => rest;

    if (profileVector) {
      console.log(
        items.map((item: any) => ({
          id: item.id,
          category: item.clothing_category ?? item.category,
          hasEmbedding: !!item.embedding,
          score: this.similarity(profileVector, item.embedding),
        })),
      );
    }

    const recommended = (
      profileVector
        ? items.map((item) => ({
            item,
            score: this.similarity(profileVector, item.embedding),
          }))
        : []
    )
      .filter((s): s is { item: T; score: number } => s.score !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RECOMMENDATIONS);

    const recommendedIds = new Set(recommended.map((s) => s.item.id));

    return {
      recommendations: recommended.map((s) => stripEmbedding(s.item)),
      items: items
        .filter((item) => !recommendedIds.has(item.id))
        .map(stripEmbedding),
    };
  }

  private async buildProfileVector(
    auth_id: string,
    profile_id: string,
    weights: ProfileVectorWeights = DEFAULT_WEIGHTS,
  ): Promise<number[] | null> {
    try {
      const [wardrobe_vector, preference_vector] = await Promise.all([
        this.getWardrobeAverageEmbedding(profile_id),
        this.getPreferenceTextEmbedding(auth_id),
      ]);

      if (wardrobe_vector && preference_vector) {
        const blended = wardrobe_vector.map(
          (value, i) =>
            value * weights.wardrobe +
            preference_vector[i] * weights.preference,
        );
        return this.normalise(blended);
      }

      return wardrobe_vector ?? preference_vector ?? null;
    } catch {
      return null;
    }
  }

  private similarity(
    profile_vector: number[],
    raw_embedding: number[] | string | null | undefined,
  ): number | null {
    if (!raw_embedding) {
      return null;
    }

    const embedding =
      typeof raw_embedding === 'string'
        ? (JSON.parse(raw_embedding) as number[])
        : raw_embedding;

    if (embedding.length !== profile_vector.length) {
      return null;
    }

    return embedding.reduce(
      (sum, value, i) => sum + value * profile_vector[i],
      0,
    );
  }

  private async getWardrobeAverageEmbedding(
    profile_id: string,
  ): Promise<number[] | null> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('embedding')
      .eq('user_id', profile_id)
      .not('embedding', 'is', null);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // pgvector columns come back from PostgREST as strings like "[0.1,0.2,...]", not arrays,
    // so parse them before doing maths on them (otherwise every component becomes NaN)
    const embeddings = (data as { embedding: number[] | string }[])
      .map((row) =>
        typeof row.embedding === 'string'
          ? (JSON.parse(row.embedding) as number[])
          : row.embedding,
      )
      .filter(Boolean);
    if (embeddings.length === 0) {
      return null;
    }

    const length = embeddings[0].length;
    const sum = Array.from<number>({ length }).fill(0);
    for (const vector of embeddings) {
      for (let i = 0; i < length; i++) {
        sum[i] += vector[i];
      }
    }

    return this.normalise(sum.map((value) => value / embeddings.length));
  }

  private async getPreferenceTextEmbedding(
    auth_id: string,
  ): Promise<number[] | null> {
    const onboarding = await this.get_onboarding(auth_id);

    if (!onboarding) {
      return null;
    }

    const texts = [
      onboarding.primary_aesthetic
        ? this.describeStyle(onboarding.primary_aesthetic)
        : null,
      ...(onboarding.style_keywords ?? []).map((k) => this.describeStyle(k)),
      ...(onboarding.colour_preferences ?? []).map((c) =>
        this.describeColour(c),
      ),
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
      throw new HttpException(
        'ML service failed to embed preferences',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const { embedding } = (await res.json()) as { embedding: number[] };
    return embedding;
  }

  private async get_onboarding(
    auth_id: string,
  ): Promise<OnboardingPreferences | null> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('onboarding')
      .select('primary_aesthetic, style_keywords, colour_preferences')
      .eq('user_id', auth_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return (data[0] as OnboardingPreferences | undefined) ?? null;
  }

  private normalise(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, value) => sum + value * value, 0),
    );
    return magnitude === 0 ? vector : vector.map((value) => value / magnitude);
  }

  private describeStyle(value: string): string {
    const key = value.trim().toLowerCase();
    return STYLE_PHRASES[key] ?? `${key} style clothing`;
  }

  private describeColour(value: string): string {
    const key = value.trim().toLowerCase();
    return COLOUR_PHRASES[key] ?? `${key} coloured clothing`;
  }

  private async check_outfit_belongs_to_user(
    auth_id: string,
    outfit_id: string,
  ) {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('outfits')
      .select('id')
      .eq('id', outfit_id)
      .eq('user_id', auth_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (data.length === 0) {
      throw new NotFoundException(
        'No outfit with specified id found for this user',
      );
    }
  }

  private async verify_items(auth_id: string, items: CreateOutfitItemDto[]) {
    const supabase = this.supabaseService.client;

    const wardrobeIds = items
      .map((item) => item.wardrobe_items_id)
      .filter((id): id is string => id !== null && id !== undefined);

    const catalogueIds = items
      .map((item) => item.catalogue_items_id)
      .filter((id): id is string => id !== null && id !== undefined);

    if (wardrobeIds.length > 0) {
      const profile_id = await this.get_profile_id(auth_id);

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('id')
        .eq('user_id', profile_id)
        .in('id', wardrobeIds);

      if (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (data.length !== wardrobeIds.length) {
        throw new NotFoundException(
          'One or more wardrobe items not found, or do not belong to this user',
        );
      }
    }

    if (catalogueIds.length > 0) {
      const { data, error } = await supabase
        .from('catalogue_items')
        .select('id')
        .in('id', catalogueIds);

      if (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (data.length !== catalogueIds.length) {
        throw new NotFoundException(
          'One or more catalogue items were not found',
        );
      }
    }
  }

  //check to ensure each outfit item is either wardrobe or catalogue item, not both and not neither
  private async validateItemSource(items: CreateOutfitItemDto[]) {
    for (const item of items) {
      const hasWardrobeItem = !!item.wardrobe_items_id;
      const hasCatalogueItem = !!item.catalogue_items_id;

      if (hasWardrobeItem === hasCatalogueItem) {
        throw new BadRequestException(
          'Exactly one of wardrobe_items_id or catalogue_items_id must be provided',
        );
      }
    }
  }

  private async get_profile_id(auth_id: string) {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', auth_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // if no user throw not found exception
    if (data.length === 0) {
      throw new NotFoundException('No user found');
    }

    return data[0].id;
  }
}
