import { Controller, Get, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { BrandsService } from "./brands.service";

@Controller('brands')
@UseGuards(SupabaseAuthGuard)
export class BrandsController {
    constructor(private brandsService: BrandsService) {}

    @Get()
    getAllBrands() {
        return this.brandsService.getAllBrands();
    }
}