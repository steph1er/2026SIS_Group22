import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class CatalogueService {
    constructor(private readonly supabaseService: SupabaseService) {}

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