import { Controller, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { CatalogueService } from "./catalogue.service";

@Controller('catalogue')
@UseGuards(SupabaseAuthGuard)
export class CatalogueController {

    constructor(private catalogueService: CatalogueService) {}
}