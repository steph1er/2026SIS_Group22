import { Controller, Get } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';

@Controller('wardrobes')
export class WardrobeController {

    constructor(private wardrobeService: WardrobeService) {}

    @Get()
    getWardrobe(): string {
        // TODO testing that code structure works
        return this.wardrobeService.getWardrobe();
    }

    // use @Get('route') where 'route' can whatever you want in the route
}