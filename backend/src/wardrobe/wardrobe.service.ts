import { Injectable } from '@nestjs/common';
import { WardrobeItem } from './interfaces/wardrobe-item.interface';

@Injectable()
export class WardrobeService {
    //constructor(private readonly supabaseService: SupabaseService)

    private readonly wardrobe: WardrobeItem[] = [];

    getWardrobe(): string{
        //const supabase = this.supabaseService.getSupabase();

        // get logged in user 
        //const currentUser = 'id'

        // get all wardrobe items for db that match that user 
        //const { data, error } = await supabase.from('wardrobe_items').select('*').eq('user_id', currentUser);

        // if no items return message
        

        // format and return

        return 'This will return all items in a users wardrobe';
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