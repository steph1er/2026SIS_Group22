import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateWardrobeItemDto } from './dto/update-wardrobe-item.dto';

@Injectable()
export class WardrobeService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getWardrobe(): Promise<any[]>{
        const supabase = this.supabaseService.client;

        // check how to authenticate user
        const user_id = "2cc61374-9c22-46a0-a253-353e09c0d6a1"

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
        const user_id = "2cc61374-9c22-46a0-a253-353e09c0d6a1"
        
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

        const {id, user_id, image_url, clothing_category, style, brand, size, colour, material, tags, modified_at, price} = updateWardrobeItemDto

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
                                                                            modified_at: modified_at,
                                                                            price: price
                                                                        })
                                                                        .eq('id', id)
                                                                        .select()

        if(updateerror){
            throw new HttpException(updateerror.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // return success response
        return updateddata;
    }

    async searchForItems(
        clothing_category? : string[],
        style? : string[],
        brand? : string[],
        size? : string[],
        colour? : string[],
        material? : string[],
        tags? : string[],
        price? : number
    ){
        const supabase = this.supabaseService.client;

        // check how to authenticate user
        const user_id = "2cc61374-9c22-46a0-a253-353e09c0d6a1";

        // check which category user is searching by
        let query = supabase.from('wardrobe_items')
                            .select('*')
                            .eq('user_id', user_id);
        
        let query_string = ''
        
        if(clothing_category && clothing_category?.length !== 0){
            query_string += `${query_string ? ',' : ''}clothing_category.in.(${clothing_category})`;
        }

        if(style && style?.length !== 0){
            const formattedArray = `{${style.map(item => `\"${item}\"`).join(',')}}`;
            query_string += `${query_string ? ',' : ''}style.ov.${formattedArray}`;
        }

        if(brand && brand?.length !== 0){
            query_string += `${query_string ? ',' : ''}brand.in.(${brand})`;
        }

        if(size && size?.length !== 0){
            query_string += `${query_string ? ',' : ''}size.in.(${size})`;
        }

        if(colour && colour?.length !== 0){
            const formattedArray = `{${colour.map(item => `\"${item}\"`).join(',')}}`;
            query_string += `${query_string ? ',' : ''}colour.ov.${formattedArray}`;
        }

        if(material && material?.length !== 0){
            const formattedArray = `{${material.map(item => `\"${item}\"`).join(',')}}`;
            query_string += `${query_string ? ',' : ''}material.ov.${formattedArray}`;
        }

        if(tags && tags?.length !== 0){
            const formattedArray = `{${tags.map(item => `\"${item}\"`).join(',')}}`;
            query_string += `${query_string ? ',' : ''}tags.ov.${formattedArray}`;
        }

        if(price && price > 0){
            // TODO check with frontend how they will use price here
            query_string += `${query_string ? ',' : ''}price.eq.${price}`;
        }

        if(!query_string || query_string.trim().length === 0) {
            throw new NotFoundException('No item found matching criteria');
        }

        query = query.or(query_string);

        // find any items in their wardrobe that match
        const { data, error } = await query;

        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no item throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No item found matching criteria');
        }

        // if yes return all matching items
        return data;
    }

    async deleteItem(id: string){
        const supabase = this.supabaseService.client;

        // check how to authenticate user
        const user_id = "2cc61374-9c22-46a0-a253-353e09c0d6a1"
        
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