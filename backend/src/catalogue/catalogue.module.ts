import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CatalogueController } from "./catalogue.controller";
import { CatalogueService } from "./catalogue.service";

@Module({
    imports: [AuthModule],
    controllers: [CatalogueController],
    providers: [CatalogueService]
})
export class CatalogueModule {}