import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BrandsController } from "./brands.controller";
import { BrandsService } from "./brands.service";

@Module({
    imports: [AuthModule],
    controllers: [BrandsController],
    providers: [BrandsService]
})
export class BrandsModule {}