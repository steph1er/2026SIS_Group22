import { Injectable } from '@nestjs/common';
import { WardrobeItem } from './interfaces/wardrobe-item.interface';

@Injectable()
export class WardrobeService {
    private readonly wardrobe: WardrobeItem[] = [];

    getWardrobe(): string{
        return 'This will return all items in a users wardrobe';
    }

    makeWardrobe(): string{
        return 'This will make a wardrobe for a user on their first time using app';
    }

    addItem(): string{
        return 'This will add an uploaded item to users wardrobe';
    }

    updateItemDetails(): string{
        return 'This will update the details of an item';
    }

    searchForItems(): string{
        return 'This will return items matching provided criteria like colour, category etc.';
    }

    deleteItem(): string{
        return 'This will delete an item from a wardrobe';
    }

}