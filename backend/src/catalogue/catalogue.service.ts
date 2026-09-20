import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class CatalogueService {
    constructor(private readonly supabaseService: SupabaseService) {}
}