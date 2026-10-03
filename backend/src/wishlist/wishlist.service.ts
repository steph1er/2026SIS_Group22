import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { AddWishlistItemDto } from "./dto/add-wishlist-item.dto";

@Injectable()
export class WishlistService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getWishlist(id: string){
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(id);

        // get all items in wishlist for logged in user
        const { data, error } = await supabase.from('wishlist')
                                              .select('*, catalogue_items!inner (*)')
                                              .eq('user_id', user_id);

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no items throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No wishlist found for current user');
        }

        // otherwise return all matching wishlist items
        return data;
    }

    async addItem(addWishlistItemDto: AddWishlistItemDto, id: string){
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(id);

        const {item_id, created_at} = addWishlistItemDto;

        // check item exists in catalogue
        const { data: item_in_catalogue, error: item_in_catalogue_error } = await supabase.from('catalogue_items')
                                                                                          .select('*')
                                                                                          .eq('id', item_id);

        if(item_in_catalogue_error){
            throw new HttpException(item_in_catalogue_error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(item_in_catalogue.length === 0) {
            throw new NotFoundException('Requested item does not exist in the current catalogue.');
        }

        // check item is not already on wishlist
        const { data: item_exists_in_wishlist, error: item_exists_wishlist_error } = await supabase.from('wishlist')
                                                                                                    .select('*')
                                                                                                    .eq('user_id', user_id)
                                                                                                    .eq('catalogue_item_id', item_id);

        if(item_exists_wishlist_error){
            throw new HttpException(item_exists_wishlist_error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(item_exists_in_wishlist.length === 0){
            // add item to wishlist table
            const { data, error } = await supabase.from('wishlist')
                                                .insert({ user_id: user_id, catalogue_item_id: item_id, created_at: created_at })
                                                .select();

            // if error throw exception
            if(error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // otherwise return success response
            return data;
        }
        else {
            throw new ConflictException('This item is already added to your wishlist.');
        }
    }

    async getWishlistItem(item_id: string, id: string){
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(id);

        // get item by id and check it belongs to logged in user
        const { data, error } = await supabase.from('wishlist')
                                              .select('*, catalogue_items!inner (*)')
                                              .eq('id', item_id)
                                              .eq('user_id', user_id);

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no item throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No wishlist item found for user with provided item id');
        }

        // otherwise item
        return data;
    }

    async removeItem(item_id: string, id: string){
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(id);

        // check requested item exists
        await this.check_item_belongs_to_user(user_id, item_id);

        // remove item from db
        const response = await supabase.from('wishlist')
                                       .delete()
                                       .eq('id', item_id);

        return response;
    }

    async searchWishlist(
        user_id: string,
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

        user_id = await this.get_profile_id(user_id);

        let query = supabase.from('wishlist')
                            .select('*, catalogue_items!inner (*, brands!inner(*))')
                            .eq('user_id', user_id);
        
        if(item_name && item_name?.length !== 0){
            query = query.ilike('catalogue_items.item_name', item_name);
        }
        
        if(clothingcategory && clothingcategory?.length !== 0){
            const clothingcategory_query = clothingcategory.map(item => `category.ilike.${item}`).join(',');
            query = query.or(clothingcategory_query, { referencedTable: 'catalogue_items' });
        }

        if(style && style?.length !== 0){
            // todo to lower
            query= query.overlaps('catalogue_items.style', style);
        }

        if(brand && brand?.length !== 0){
            const brand_query = brand.map(item => `brand_name.ilike.${item}`).join(',');
            query = query.or(brand_query, { referencedTable: 'catalogue_items.brands' });
        }

        if(size && size?.length !== 0){
            const sizes = this.mapSizeOptions(size.at(0) ?? "error");
            query = query.overlaps('catalogue_items.available_sizes', sizes);
        }

        if(colour && colour?.length !== 0){
            // todo to lower
            query= query.overlaps('catalogue_items.colour', colour);
        }

        if(material && material?.length !== 0){
            // todo to lower
            query= query.overlaps('catalogue_items.materials', material);
        }

        if(max_price && max_price > 0){
            if(min_price){
                // finds rows where value is less than or equal to max price
                query = query.lte('catalogue_items.price', max_price);

                // finds rows where value is greater than or equal to min price
                query = query.gte('catalogue_items.price', min_price);
            }
            else {
                // if no min price assume min price as 0 therefore no need to set greater than
                query = query.lte('catalogue_items.price', max_price);
            }
        }

        // find any items in catalogue that match
        const { data, error } = await query;

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
    
    private async check_item_belongs_to_user(user_id: string, item_id: string) {
        const supabase = this.supabaseService.client;

        const { data, error } = await supabase.from('wishlist')
                                              .select('*')
                                              .eq('id', item_id)
                                              .eq('user_id', user_id);
        
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no item throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No item found for user with provided item id');
        }
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