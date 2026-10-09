import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class CatalogueService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getCatalogueReccomendations(user_id: string, limit: number, offset: number) {
        // TODO - implement properly with machine learning logic - for now returning catalogue items in a fixed order
        const supabase = this.supabaseService.client;

        const profile_id = await this.get_profile_id(user_id);

        // items already on the user's wishlist are not reccomended again
        const { data: wishlist, error: wishlist_error } = await supabase.from('wishlist')
                                                                        .select('catalogue_item_id')
                                                                        .eq('user_id', profile_id);

        if(wishlist_error){
            throw new HttpException(wishlist_error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // include each item's brand (left join so items without a brand are still returned)
        let query = supabase.from('catalogue_items')
                            .select('*, brands (*)');

        const saved_ids = wishlist.map(row => row.catalogue_item_id).filter(Boolean);
        if(saved_ids.length !== 0){
            query = query.not('id', 'in', `(${saved_ids.join(',')})`);
        }

        // a stable order so each page (offset) continues where the last one ended
        const { data, error } = await query.order('created_at', { ascending: true })
                                           .order('id', { ascending: true })
                                           .range(offset, offset + limit - 1);

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no item throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No reccomended catalogue items found.');
        }

        // otherwise item
        return data;
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
            query = query.ilike('item_name', item_name);
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