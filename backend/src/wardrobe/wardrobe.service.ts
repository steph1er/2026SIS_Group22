import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateWardrobeItemDto } from './dto/update-wardrobe-item.dto';

@Injectable()
export class WardrobeService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getWardrobe(id: string): Promise<any[]>{
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(id);

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

    async getWardrobeItem(id: string, auth_id: string): Promise<any[]>{
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(auth_id);
        
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

    async updateItemDetails(updateWardrobeItemDto: UpdateWardrobeItemDto, auth_id: string){
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(auth_id);

        let {id, image_url, clothing_category, style, brand, size, colour, material, tags, modified_at, price} = updateWardrobeItemDto

        clothing_category = clothing_category.toLowerCase();
        style = style.map((item) => item.toLowerCase());
        brand = brand.toLowerCase();
        size = size.toLowerCase();
        colour = colour.map((item) => item.toLowerCase());
        material = material.map((item) => item.toLowerCase());
        tags = tags.map((item) => item.toLowerCase());

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
        id: string,
        clothing_category? : string[],
        style? : string[],
        brand? : string[],
        size? : string[],
        colour? : string[],
        material? : string[],
        tags? : string[],
        min_price? : number,
        max_price? : number
    ){
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(id);

        let query = supabase.from('wardrobe_items')
                            .select('*')
                            .eq('user_id', user_id);
        
        if(clothing_category && clothing_category?.length !== 0){
            const clothing_category_query = clothing_category.map(category => `clothing_category.ilike.${category}`).join(',');
            query = query.or(clothing_category_query);
        }

        if(style && style?.length !== 0){
            query= query.overlaps('style', style);
        }

        if(brand && brand?.length !== 0){
            const brand_query = brand.map(item => `brand.ilike.${item}`).join(',');
            query = query.or(brand_query);
        }

        // TODO set up how different sizes are equal
        if(size && size?.length !== 0){
            const size_query = size.map(item => `size.ilike.${item}`).join(',');
            query = query.or(size_query);
        }

        if(colour && colour?.length !== 0){
            query= query.overlaps('colour', colour);
        }

        if(material && material?.length !== 0){
            query= query.overlaps('material', material);
        }

        if(tags && tags?.length !== 0){
            query= query.overlaps('tags', tags);
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

    async deleteItem(id: string, auth_id: string){
        const supabase = this.supabaseService.client;

        const user_id = await this.get_profile_id(auth_id);
        
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