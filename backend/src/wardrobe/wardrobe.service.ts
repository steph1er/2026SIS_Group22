import { Injectable } from '@nestjs/common';
import { Wardrobe } from './interfaces/wardrobe.interface';

@Injectable()
export class WardrobeService {
    private readonly wardrobes: Wardrobe[] = [];

    // TODO - just testing structure works
    getWardrobe(): string {
        return 'This is a wardrobe';
    }

}