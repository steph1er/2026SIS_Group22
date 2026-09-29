import { Test } from "@nestjs/testing";
import { WishlistService } from "../wishlist.service";
import { SupabaseService } from "../../supabase/supabase.service";
import { HttpException, NotFoundException } from "@nestjs/common";

describe('WishlistContoller', () => {
    let wishlistService: WishlistService;
    let supabaseClient: SupabaseService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                WishlistService,
                {
                    provide: SupabaseService,
                    useValue: {
                        client: {
                            from: jest.fn(),
                            select: jest.fn(),
                            eq: jest.fn()
                        }
                    }
                }
            ]
        })
        .compile();

        wishlistService = moduleRef.get(WishlistService);
        supabaseClient = moduleRef.get(SupabaseService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Get Wishlist', () => {
        it('should return all items in a wishlist', async () => {
            const id = 'wishlist item id';

            const getProfileMock = [{
                "id": "profile id",
                "display_name": "user",
                "body_type": null,
                "size": "M",
                "created_at": "time",
                "onboarding_completed": false,
                "onboarding_completed_at": null
            }];

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
            }];

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // mock get wishlist items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                })
            } as any);

            expect(await wishlistService.getWishlist(id)).toBe(expectedResult);
        });

        it('when error in db return internal server error', async () => {
            const id = 'wishlist item id';

            const getProfileMock = [{
                "id": "profile id",
                "display_name": "user",
                "body_type": null,
                "size": "M",
                "created_at": "time",
                "onboarding_completed": false,
                "onboarding_completed_at": null
            }];

            const errorMock = {
                code: "error code",
                details: "error details",
                hint: "hint to solve error",
                message: "error message"
            };

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // mock get wishlist items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: null, error: errorMock })
                })
            } as any);

            await expect(wishlistService.getWishlist(id)).rejects.toThrow(HttpException);
        });

        it('when no result found returns not found', async () => {
            const id = 'wishlist item id';

            const getProfileMock = [{
                "id": "profile id",
                "display_name": "user",
                "body_type": null,
                "size": "M",
                "created_at": "time",
                "onboarding_completed": false,
                "onboarding_completed_at": null
            }];

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // mock get wishlist items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                })
            } as any);

            await expect(wishlistService.getWishlist(id)).rejects.toThrow(NotFoundException);
        });
    });
});