import { Test } from "@nestjs/testing";
import { WishlistController } from "../wishlist.controller"
import { WishlistService } from "../wishlist.service";
import { SupabaseAuthGuard } from "../../auth/supabase-auth.guard";
import { User } from "@supabase/supabase-js";

describe('WishlistContoller', () => {
    let wishlistContoller: WishlistController;
    let wishlistService: WishlistService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [WishlistController],
            providers: [
                {
                    provide: WishlistService,
                    useValue: {
                        getWishlist: jest.fn()
                    }
                }
            ]
        })
        .overrideGuard(SupabaseAuthGuard)
        .useValue({ canActivate: () => true })
        .compile();

        wishlistService = moduleRef.get(WishlistService);
        wishlistContoller = moduleRef.get(WishlistController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Get Wishlist', () => {
        it('should return all items in a wishlist', async () => {
            const expectedResult = [{
                "id": "item id",
                "user_id": "user id",
                "catalogue_item_id": "catalogue item id",
                "created_at": "2026-09-19T01:18:00+00:00",
                "catalogue_items": {
                    "id": "catalogue item id",
                    "price": 25,
                    "style": ["Fitted", "Reversible"],
                    "colour": ["Aqua", "Brown"],
                    "brand_id": "brand id",
                    "category": "Tops",
                    "image_url": "image url",
                    "item_name": "Smooth Jade Reversible Top",
                    "materials": ["Viscose", "Elastane"],
                    "created_at": "2026-09-18T03:41:23.638604+00:00",
                    "product_url": "product url",
                    "available_sizes": ["3XS", "2XS", "XS", "S", "M", "L", "XL"]
                }
            },
            {
                "id": "item id 2",
                "user_id": "user id",
                "catalogue_item_id": "catalogue item id 2",
                "created_at": "2026-09-19T01:18:00+00:00",
                "catalogue_items": {
                    "id": "catalogue item id 2",
                    "price": 35,
                    "style": ["Mini", "Low Rise", "Reversible"],
                    "colour": ["Aqua", "Brown"],
                    "brand_id": "brand id",
                    "category": "Skirts",
                    "image_url": "image url",
                    "item_name": "Smooth Jade Reversible Mini Skirt",
                    "materials": ["Viscose"],
                    "created_at": "2026-09-18T03:41:23.638604+00:00",
                    "product_url": "product url",
                    "available_sizes": ["3XS", "2XS", "XS", "S", "M", "L", "XL"]
                }
            }]

            jest.spyOn(wishlistService, 'getWishlist').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.getWishlist(mockUser as User)).toBe(expectedResult);
        });

        /*it('should return NotFoundException when no items in wishlist', async () => {
            
        });

        it('should return INTERNAL_SERVER_ERROR when issue with db', async () => {
            
        });*/
    });

    /*describe('Add item to wishlist', () => {

    });

    describe('Get item from wishlist by ID', () => {

    });

    describe('Delete item in wishlist by id', () => {

    });*/
});