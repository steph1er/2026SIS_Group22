import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { WardrobeItem } from './interfaces/wardrobe-item.interface';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WardrobeService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getWardrobe(): Promise<any[]>{
        const supabase = this.supabaseService.client;

        // get logged in user 
        //const currentUser = 'id'

        // get all wardrobe items for db that match that user TODO - change to logged in user
        //const { data, error } = await supabase.from('wardrobe_items').select('*').eq('user_id', currentUser);
        const { data, error } = await supabase.from('wardrobe_items').select('*');

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

    addItem(): string{
        // get logged in user 

        // take uploaded image and put through machine learning to analyse categories

        // format response and return for your to verify output (update item which will include brand etc.)

        return 'This will add an uploaded item to users wardrobe';
    }

    updateItemDetails(): string{
        // get logged in user 

        // check requested item exists

        // update details

        // return success response

        return 'This will update the details of an item';
    }

    searchForItems(): string{
        // get logged in user

        // check which category user is searching by

        // find any items in their wardrobe that match

        // if none return error message

        // if yes return all matching items

        return 'This will return items matching provided criteria like colour, category etc.';
    }

    deleteItem(): string{
        // get logged in user 

        // check requested item exists

        // remove item from db

        // return success response

        return 'This will delete an item from a wardrobe';
    }

}