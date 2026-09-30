import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
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
}