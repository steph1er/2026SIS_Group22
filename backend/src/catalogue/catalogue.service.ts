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