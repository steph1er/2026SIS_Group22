import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateWardrobeItemDto } from './dto/update-wardrobe-item.dto';

@Injectable()
export class WardrobeService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getWardrobe(): Promise<any[]>{
        const supabase = this.supabaseService.client;

        // check how to authenticate user
        const user_id = "testing"

        // get all items for logged in user
        const { data, error } = await supabase.from('wardrobe_items')
                                              .select('*')
                                              .eq('user_id', user_id);

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no items throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No wardrobe items found for current user');
        }
        
        // otherwise return all matching wardrobe items
        return data;
    }

    async getWardrobeItem(id: string): Promise<any[]>{
        const supabase = this.supabaseService.client;

        // check how to authenticate user
        const user_id = "testing"
        
        // get item by id and check it belongs to logged in user
        const { data, error } = await supabase.from('wardrobe_items')
                                              .select('*')
                                              .eq('id', id)
                                              .eq('user_id', user_id);

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no item throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No item found for user with provided item id');
        }

        // otherwise item
        return data;
    }

    addItem(): string{
        // get logged in user 

        // take uploaded image and put through machine learning to analyse categories

        // format response and return for your to verify output (update item which will include brand etc.)

        return 'This will add an uploaded item to users wardrobe';
    }

    async updateItemDetails(updateWardrobeItemDto: UpdateWardrobeItemDto){
        const supabase = this.supabaseService.client;

        const {id, user_id, image_url, clothing_category, style, brand, size, colour, material, tags, modified_at} = updateWardrobeItemDto

        // check how to authenticate user

        // check requested item exists
        await this.check_item_belongs_to_user(user_id, id);

        // update details
        const { data: updateddata, error: updateerror } = await supabase.from('wardrobe_items')
                                                                        .update({  
                                                                            image_url: image_url,
                                                                            clothing_category: clothing_category,
                                                                            style: style,
                                                                            brand: brand,
                                                                            size: size,
                                                                            colour: colour,
                                                                            material: material,
                                                                            tags: tags,
                                                                            modified_at: modified_at
                                                                        })
                                                                        .eq('id', id)
                                                                        .select()

        if(updateerror){
            throw new HttpException(updateerror.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // return success response
        return updateddata;
    }

    searchForItems(): string{
        // get logged in user

        // check which category user is searching by

        // find any items in their wardrobe that match

        // if none return error message

        // if yes return all matching items

        return 'This will return items matching provided criteria like colour, category etc.';
    }

    async deleteItem(id: string){
        const supabase = this.supabaseService.client;

        // check how to authenticate user
        const user_id = "user"
        
        // check requested item exists
        await this.check_item_belongs_to_user(user_id, id);

        // remove item from db
        const response = await supabase.from('wardrobe_items')
                                       .delete()
                                       .eq('id', id);

        return response;
    }

    private async check_item_belongs_to_user(user_id: string, item_id: string) {
        const supabase = this.supabaseService.client;

        const { data, error } = await supabase.from('wardrobe_items')
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

}