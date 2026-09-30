import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class AddWishlistItemDto {
    @IsString()
    @IsNotEmpty()
    item_id: string;

    @IsDate()
    @IsNotEmpty()
    created_at: Date;
}