import { Test } from "@nestjs/testing";
import { WishlistService } from "../wishlist.service";
import { SupabaseService } from "../../supabase/supabase.service";
import { ConflictException, HttpException, NotFoundException } from "@nestjs/common";
import { AddWishlistItemDto } from "../dto/add-wishlist-item.dto";

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
                            eq: jest.fn(),
                            insert: jest.fn(),
                            delete: jest.fn()
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

    describe('Add Item', () => {
        it('HttpException when getting catalogue items', async () => {
            const id = 'user id';

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

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

            // mock check item exists in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: null, error: errorMock })
                })
            } as any);

            await expect(wishlistService.addItem(mockAddWishlistItemDto, id)).rejects.toThrow(HttpException);
        });

        it('NotFoundException when trying to add item that doesnt exist', async () => {
            const id = 'user id';

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

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

            // mock check item exists in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                })
            } as any);

            await expect(wishlistService.addItem(mockAddWishlistItemDto, id)).rejects.toThrow(NotFoundException);
        });

        it('HttpException when checking item isnt already in wishlist', async () => {
            const id = 'user id';

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

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

            // mock check item exists in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [{id: "id"}], error: null })
                })
            } as any);

            // mock check item not already in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: null, error: errorMock })
                    })
                })
            } as any);

            await expect(wishlistService.addItem(mockAddWishlistItemDto, id)).rejects.toThrow(HttpException);
        });

        it('ConflictException when item is already in wishlist', async () => {
            const id = 'user id';

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

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

            // mock check item exists in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [{id: "id"}], error: null })
                })
            } as any);

            // mock check item not already in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [{id: "id"}], error: null })
                    })
                })
            } as any);

            await expect(wishlistService.addItem(mockAddWishlistItemDto, id)).rejects.toThrow(ConflictException);
        });

        it('HttpException when trying to add item to db wishlist table', async () => {
            const id = 'user id';

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

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

            // mock check item exists in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [{id: "id"}], error: null })
                })
            } as any);

            // mock check item not already in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                })
            } as any);

            // mock insert item to wishlist
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                insert: jest.fn().mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({ data: null, error: errorMock })
                })
            } as any);

            await expect(wishlistService.addItem(mockAddWishlistItemDto, id)).rejects.toThrow(HttpException);
        });

        it('successfully adding item to wishlist table', async () => {
            const id = 'user id';

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

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

            // mock check item exists in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [{id: "id"}], error: null })
                })
            } as any);

            // mock check item not already in catalogue
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                })
            } as any);

            // mock insert item to wishlist
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                insert: jest.fn().mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({ data: mockAddWishlistItemDto, error: null })
                })
            } as any);

            expect(await wishlistService.addItem(mockAddWishlistItemDto, id)).toBe(mockAddWishlistItemDto);
        });
    });

    describe('Get Wishlist item by id', () => {
        it('HttpException trying to get item from wishlist table', async () => {
            const user_id = 'user id';
            const item_id = 'item id'

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

            // mock check item exists in wihslist
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: null, error: errorMock })
                    })
                })
            } as any);

            await expect(wishlistService.getWishlistItem(item_id, user_id)).rejects.toThrow(HttpException);
        });

        it('NotFoundException when no item matching id in wishlist', async () => {
            const user_id = 'user id';
            const item_id = 'item id'

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

            // mock check item exists in wihslist
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                })
            } as any);

            await expect(wishlistService.getWishlistItem(item_id, user_id)).rejects.toThrow(NotFoundException);
        });

        it('successfully gets item with matching id from wishlist', async () => {
            const user_id = 'user id';
            const item_id = 'item id'

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
                "id": "wishlist item id",
                "user_id": "user id",
                "catalogue_item_id": "catalogue item id",
                "created_at": "2026-09-19T01:18:00+00:00",
                "catalogue_items": {
                    "id": "catalogue item id",
                    "price": 15,
                    "style": ["Fitted", "3/4 Sleeve", "Boat Neckline"],
                    "colour": ["Brown"],
                    "brand_id": "brand id",
                    "category": "Tops",
                    "image_url": "image url",
                    "item_name": "Sleek Ziggy 3/4 Sleeve Top",
                    "materials": ["Polyamide", "Elastane"],
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

            // mock check item exists in wihslist
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                    })
                })
            } as any);

            expect(await wishlistService.getWishlistItem(item_id, user_id)).toBe(expectedResult);
        });
    });

    describe('Delete wishlist item', () => {
        it('item does not belong to user returns not found exception', async () => {
            const user_id = 'user id';
            const item_id = 'item id'

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

            // mock check item belongs to user
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                })
            } as any);

            await expect(wishlistService.removeItem(item_id, user_id)).rejects.toThrow(NotFoundException);
        });

        it('successfully deletes wishlist item', async () => {
            const user_id = 'user id';
            const item_id = 'item id'

            const getProfileMock = [{
                "id": "profile id",
                "display_name": "user",
                "body_type": null,
                "size": "M",
                "created_at": "time",
                "onboarding_completed": false,
                "onboarding_completed_at": null
            }];

            const item = [{
                "id": "wishlist item id",
                "user_id": "user id",
                "catalogue_item_id": "catalogue item id",
                "created_at": "2026-09-19T01:18:00+00:00",
                "catalogue_items": {
                    "id": "catalogue item id",
                    "price": 15,
                    "style": ["Fitted", "3/4 Sleeve", "Boat Neckline"],
                    "colour": ["Brown"],
                    "brand_id": "brand id",
                    "category": "Tops",
                    "image_url": "image url",
                    "item_name": "Sleek Ziggy 3/4 Sleeve Top",
                    "materials": ["Polyamide", "Elastane"],
                    "created_at": "2026-09-18T03:41:23.638604+00:00",
                    "product_url": "product url",
                    "available_sizes": ["3XS", "2XS", "XS", "S", "M", "L", "XL"]
                }
            }];

            const expectedResult ={
                "success": true,
                "error": null,
                "data": null,
                "count": null,
                "status": 204,
                "statusText": "No Content"
            };

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // mock check item belongs to user
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: item, error: null })
                    })
                })
            } as any);

            // mock delete item from wishlist
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                delete: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce(expectedResult)
                })
            } as any);

            expect(await wishlistService.removeItem(item_id, user_id)).toBe(expectedResult);
        });
    });
});