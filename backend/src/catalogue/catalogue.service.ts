import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class CatalogueService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getCatalogueReccomendations(user_id: string) {
        // TODO - implement properly with machine learning logic - for now just getting first 10 catalogue items
        const supabase = this.supabaseService.client;

        const { data, error } = await supabase.from('catalogue_items')
                                                .select('*')
                                                .limit(10);

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

         // check which category user is searching by
        let query = supabase.from('catalogue_items')
                            .select('*, brands!inner (*)');

        // TODO how to check remove back for case (doesn't matter upper or lower etc.)

        if(item_name && item_name?.length !== 0){
            query = query.eq('item_name', item_name);
        }
        
        if(clothingcategory && clothingcategory?.length !== 0){
            query = query.in('category', clothingcategory);
        }

        if(style && style?.length !== 0){
            query= query.overlaps('style', style);
        }

        if(brand && brand?.length !== 0){
            query = query.in('brands.brand_name', brand);
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
        
        // get item by id 
        const { data, error } = await supabase.from('catalogue_items')
                                                .select('*')
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