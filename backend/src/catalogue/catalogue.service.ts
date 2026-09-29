import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { mixedFeedOrder } from "./feed-order";

@Injectable()
export class CatalogueService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getCatalogueReccomendations(user_id: string, limit: number, offset: number, seed?: string) {
        // TODO - implement properly with machine learning logic - for now returning catalogue items in a mixed order
        const supabase = this.supabaseService.client;

        const profile_id = await this.get_profile_id(user_id);

        // items already on the user's wishlist are not reccomended again
        const { data: wishlist, error: wishlist_error } = await supabase.from('wishlist')
                                                                        .select('catalogue_item_id')
                                                                        .eq('user_id', profile_id);

        if(wishlist_error){
            throw new HttpException(wishlist_error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const { data: catalogue, error: catalogue_error } = await supabase.from('catalogue_items')
                                                                          .select('id, brand_id');

        if(catalogue_error){
            throw new HttpException(catalogue_error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // mix brands together. The order covers the whole catalogue and only depends on the seed, so each
        // page (offset) continues where the last one ended. Without a seed the order changes daily per user.
        const feed_seed = seed ?? `${user_id}-${new Date().toISOString().slice(0, 10)}`;
        const saved_ids = new Set(wishlist.map(row => row.catalogue_item_id));
        const page_ids = mixedFeedOrder(catalogue, feed_seed)
            .filter(id => !saved_ids.has(id))
            .slice(offset, offset + limit);

        // if no item throw not found exception
        if(page_ids.length === 0){
            throw new NotFoundException('No reccomended catalogue items found.');
        }

        // include each item's brand (left join so items without a brand are still returned)
        const { data, error } = await supabase.from('catalogue_items')
                                              .select('*, brands (*)')
                                              .in('id', page_ids);

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // return the items in feed order
        const position = new Map(page_ids.map((id, index) => [id, index]));
        return data.sort((a, b) => position.get(a.id)! - position.get(b.id)!);
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
            query= query.overlaps('style', style);
        }

        if(brand && brand?.length !== 0){
            const brand_query = brand.map(item => `brand_name.ilike.${item}`).join(',');
            query = query.or(brand_query, { referencedTable: 'brands' });
        }

        // TODO set up how different sizes are equal
        if(size && size?.length !== 0){
            query = query.overlaps('available_sizes', size);
        }

        if(colour && colour?.length !== 0){
            query= query.overlaps('colour', colour);
        }

        if(material && material?.length !== 0){
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
}