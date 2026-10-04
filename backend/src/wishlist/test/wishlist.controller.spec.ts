import { Test } from "@nestjs/testing";
import { WishlistController } from "../wishlist.controller"
import { WishlistService } from "../wishlist.service";
import { SupabaseAuthGuard } from "../../auth/supabase-auth.guard";
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { AddWishlistItemDto } from "../dto/add-wishlist-item.dto";
import { NotFoundException } from "@nestjs/common";

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
                        getWishlist: jest.fn(),
                        addItem: jest.fn(),
                        getWishlistItem: jest.fn(),
                        removeItem: jest.fn()
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

        it('should return NotFoundException when no items in wishlist', async () => {
            const expectedResult = [{
                "message": "No wishlist found for current user",
                "error": "Not Found",
                "statusCode": 404
            }];

            jest.spyOn(wishlistService, 'getWishlist').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.getWishlist(mockUser as User)).toBe(expectedResult);
        });

        it('should return INTERNAL_SERVER_ERROR when issue with db', async () => {
            const expectedResult = [{
                "message": "Error from DB",
                "error": "Internal Server Error",
                "statusCode": 500
            }];

            jest.spyOn(wishlistService, 'getWishlist').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.getWishlist(mockUser as User)).toBe(expectedResult);
        });
    });

    describe('Add item to wishlist', () => {
        it('should return INTERNAL_SERVER_ERROR when issue with db', async () => {
            const expectedResult = [{
                "message": "Error from DB",
                "error": "Internal Server Error",
                "statusCode": 500
            }];

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

            jest.spyOn(wishlistService, 'addItem').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.addItemToWishlist(mockAddWishlistItemDto, mockUser as User)).toBe(expectedResult);
        });

        it('when item does not exist in catalogue Not Found Error returned', async () => {
            const expectedResult = [{
                "message": "Requested item does not exist in the current catalogue.",
                "error": "Not Found",
                "statusCode": 404
            }];

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'invalid item id',
                created_at: new Date(2026, 8, 29)
            };

            jest.spyOn(wishlistService, 'addItem').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.addItemToWishlist(mockAddWishlistItemDto, mockUser as User)).toBe(expectedResult);
        });

        it('successfully added item to wishlist', async () => {
            const expectedResult = [
                {
                    "id": "wishlist item id",
                    "user_id": "user id",
                    "catalogue_item_id": "item id",
                    "created_at": "2026-09-19T01:18:00+00:00"
                }
            ];

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 9, 19)
            };

            jest.spyOn(wishlistService, 'addItem').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.addItemToWishlist(mockAddWishlistItemDto, mockUser as User)).toBe(expectedResult);
        });

        it('when item already in wishlist conflict error returned', async () => {
            const expectedResult = [{
                "message": "This item is already added to your wishlist.",
                "error": "Conflict Exception",
                "statusCode": 409
            }];

            const mockAddWishlistItemDto: AddWishlistItemDto = {
                item_id: 'item id',
                created_at: new Date(2026, 8, 29)
            };

            jest.spyOn(wishlistService, 'addItem').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.addItemToWishlist(mockAddWishlistItemDto, mockUser as User)).toBe(expectedResult);
        });
    });

    describe('Get item from wishlist by ID', () => {
        it('error occured in db returned internal server error', async () => {
            const expectedResult = [{
                "message": "Error from DB",
                "error": "Internal Server Error",
                "statusCode": 500
            }];

            jest.spyOn(wishlistService, 'getWishlistItem').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.getItemFromWishlist("wishlist item id", mockUser as User)).toBe(expectedResult);
        });

        it('no item in wishlist found matching id', async () => {
            const expectedResult = [{
                "message": "No wishlist item found for user with provided item id",
                "error": "Not Found",
                "statusCode": 404
            }];

            jest.spyOn(wishlistService, 'getWishlistItem').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.getItemFromWishlist("wishlist item id", mockUser as User)).toBe(expectedResult);
        });

        it('get item by id returns item', async () => {
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

            jest.spyOn(wishlistService, 'getWishlistItem').mockResolvedValueOnce(expectedResult);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.getItemFromWishlist("wishlist item id", mockUser as User)).toBe(expectedResult);
        });
    });

    describe('Delete item in wishlist by id', () => {
        it('not found error when no matching item for user', async () => {
            jest.spyOn(wishlistService, 'removeItem').mockRejectedValueOnce(new NotFoundException('No item found for user with provided item id'));

            const mockUser = { id: "user id" }

            await expect(wishlistContoller.removeItemFromWishlist("wishlist item id", mockUser as User)).rejects.toThrow(NotFoundException);
        });

        it('successfully removes item from wishlist', async () => {
            const expectedResult ={
                "success": true,
                "error": null,
                "data": null,
                "count": null,
                "status": 204,
                "statusText": "No Content"
            };

            jest.spyOn(wishlistService, 'removeItem').mockResolvedValueOnce(expectedResult as PostgrestSingleResponse<null>);

            const mockUser = { id: "user id" }

            expect(await wishlistContoller.removeItemFromWishlist("wishlist item id", mockUser as User)).toBe(expectedResult);
        });
    });
});