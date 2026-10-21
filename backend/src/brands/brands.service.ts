import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class BrandsService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async getAllBrands(){
        const supabase = this.supabaseService.client;

        // get all items in brands
        const { data, error } = await supabase.from('brands')
                                              .select('brand_name');

        // if error return error message
        if(error){
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // if no brands throw not found exception
        if(data.length === 0){
            throw new NotFoundException('No brands found');
        }

        // otherwise return all brands
        return data;
    }
}