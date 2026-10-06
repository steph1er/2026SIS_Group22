import { Test } from "@nestjs/testing";
import { SupabaseService } from "../../supabase/supabase.service";
import { WardrobeService } from "../wardrobe.service";
import { HttpException, NotFoundException } from "@nestjs/common";
import { UpdateWardrobeItemDto } from "../dto/update-wardrobe-item.dto";

describe('WardrobeService', () => {
    let wardrobeService: WardrobeService;
    let supabaseClient: SupabaseService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                WardrobeService,
                {
                    provide: SupabaseService,
                    useValue: {
                        client: {
                            from: jest.fn(),
                            select: jest.fn(),
                            eq: jest.fn(),
                            insert: jest.fn(),
                            delete: jest.fn(),
                            ilike: jest.fn(),
                            or: jest.fn(),
                            overlaps: jest.fn(),
                            lte: jest.fn(),
                            gte: jest.fn(),
                            update: jest.fn()
                        }
                    }
                }
            ]
        })
        .compile();

        wardrobeService = moduleRef.get(WardrobeService);
        supabaseClient = moduleRef.get(SupabaseService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Search Wardrobe', () => {
        it('should return all items matching search criteria', async () => {
            const id = 'user id';
            const clothingcategory = ['jeans'];
            const style = ['baggy'];
            const brand = ['levis'];
            const size = ['M'];
            const colour = ['blue'];
            const material = ['cotton'];
            const tags = ['basics'];
            const min_price = 20;
            const max_price = 80;

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
                "id": "wardrobe item id",
                "user_id": "user id",
                "image_url": "image",
                "clothing_category": "jeans",
                "style": ['baggy', 'everyday'],
                "brand": 'levis',
                "size": 'M',
                "colour": ['blue'],
                "material": ['cotton'],
                "tags": ['basics'],
                "created_at": "2026-09-19T08:06:15.657186+00:00",
                "modified_at": "2026-09-14T16:03:00+00:00",
                "price": 70
            }];

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // mock search
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        or: jest.fn().mockReturnValueOnce({
                            overlaps: jest.fn().mockReturnValueOnce({
                                or: jest.fn().mockReturnValueOnce({
                                    or: jest.fn().mockReturnValueOnce({
                                        overlaps: jest.fn().mockReturnValueOnce({
                                                overlaps: jest.fn().mockReturnValueOnce({
                                                        overlaps: jest.fn().mockReturnValueOnce({
                                                            lte: jest.fn().mockReturnValueOnce({ 
                                                                gte: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            } as any);

            expect(await wardrobeService.searchForItems(id, 
                clothingcategory, 
                style,
                brand,
                size,
                colour,
                material,
                tags,
                min_price,
                max_price
                )).toBe(expectedResult);
        });

        it('http exception', async () => {
            const id = 'user id';
            const clothingcategory = ['jeans'];
            const style = ['baggy'];
            const brand = ['levis'];
            const size = ['M'];
            const colour = ['blue'];
            const material = ['cotton'];
            const tags = ['basics'];
            const min_price = 20;
            const max_price = 80;

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

            // mock search
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        or: jest.fn().mockReturnValueOnce({
                            overlaps: jest.fn().mockReturnValueOnce({
                                or: jest.fn().mockReturnValueOnce({
                                    or: jest.fn().mockReturnValueOnce({
                                        overlaps: jest.fn().mockReturnValueOnce({
                                                overlaps: jest.fn().mockReturnValueOnce({
                                                        overlaps: jest.fn().mockReturnValueOnce({
                                                            lte: jest.fn().mockReturnValueOnce({ 
                                                                gte: jest.fn().mockReturnValueOnce({ data: [], error: errorMock })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            } as any);

            await expect(wardrobeService.searchForItems(id, 
                clothingcategory, 
                style,
                brand,
                size,
                colour,
                material,
                tags,
                min_price,
                max_price
                )).rejects.toThrow(HttpException);
        });

        it('http exception', async () => {
            const id = 'user id';
            const clothingcategory = ['jeans'];

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

            // mock search
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        or: jest.fn().mockReturnValueOnce({
                            data: [], error: null
                        })
                    })
                })
            } as any);

            await expect(wardrobeService.searchForItems(id, 
                clothingcategory
            )).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Wardrobe', () => {
        it('get users wardrobe', async () => {
            const id = "user id";

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
                "id": "wardrobe item id",
                "user_id": "user id",
                "image_url": "image",
                "clothing_category": "shorts",
                "style": ["exercise"],
                "colour": ["black"],
                "created_at": "2026-09-19T08:07:08.194152+00:00",
                "modified_at": null,
                "brand": "lululemon",
                "size": "medium",
                "material": ["nylon"],
                "tags": null,
                "price": 60.99
            },
            {
                "id": "wardrobe item id 2",
                "user_id": "user id",
                "image_url": "image",
                "clothing_category": "top",
                "style": ["basics", "casual"],
                "colour": ["white"],
                "created_at": "2026-09-19T08:08:11.838639+00:00",
                "modified_at": null,
                "brand": "cotton on",
                "size": "small",
                "material": ["cotton"],
                "tags": null,
                "price": 19.99
            }];

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // mock get user's wardrobe items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                })
            } as any);

            expect(await wardrobeService.getWardrobe(id)).toBe(expectedResult);
        });

        it('HttpException error when getting wardrobe', async () => {
            const id = "user id";

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

            // mock get user's wardrobe items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [], error: errorMock })
                })
            } as any);

            await expect(wardrobeService.getWardrobe(id)).rejects.toThrow(HttpException);
        });

        it('Not found exception when no items in wardrobe', async () => {
            const id = "user id";

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

            // mock get user's wardrobe items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                })
            } as any);

            await expect(wardrobeService.getWardrobe(id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Wardrobe Item by ID', () => {
        it('get users wardrobe item by id', async () => {
            const id = "wardrobe item id";
            const user_id = "user id";

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
                "id": "wardrobe item id",
                "user_id": "user id",
                "image_url": "image",
                "clothing_category": "shorts",
                "style": ["exercise"],
                "colour": ["black"],
                "created_at": "2026-09-19T08:07:08.194152+00:00",
                "modified_at": null,
                "brand": "lululemon",
                "size": "medium",
                "material": ["nylon"],
                "tags": null,
                "price": 60.99
            }];

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // mock get user's wardrobe item
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        eq: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                    })
                })
            } as any);

            expect(await wardrobeService.getWardrobeItem(id, user_id)).toBe(expectedResult);
        });

        it('HttpException error when getting wardrobe item', async () => {
            const id = "wardrobe item id";
            const user_id = "user id";

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

            // mock get user's wardrobe items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: errorMock })
                    })
                })
            } as any);

            await expect(wardrobeService.getWardrobeItem(id, user_id)).rejects.toThrow(HttpException);
        });

        it('NotFoundException error when no item found', async () => {
            const id = "wardrobe item id";
            const user_id = "user id";

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

            // mock get user's wardrobe items
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                })
            } as any);

            await expect(wardrobeService.getWardrobeItem(id, user_id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Update Wardrobe Item', () => {
        it('successfully updated wardrobe item', async () => {
            const user_id = "user id";

            const getProfileMock = [{
                "id": "profile id",
                "display_name": "user",
                "body_type": null,
                "size": "M",
                "created_at": "time",
                "onboarding_completed": false,
                "onboarding_completed_at": null
            }];

            const updateWardrobeItemDto: UpdateWardrobeItemDto = {
                id: "wardrobe item id",
                image_url: "new image",
                clothing_category: "jeans",
                style: ["baggy"],
                brand: "levis",
                size: "28",
                colour: ["denim blue"],
                material: ["cotton"],
                tags: ["everyday", "lightweight"],
                modified_at: new Date(2026, 10, 6),
                price: 70.00
            }

            const oldRecord = [{
                "id": "wardrobe item id",
                "user_id": "user id",
                "image_url": "image",
                "clothing_category": "jeans",
                "style": ["baggy"],
                "colour": ["blue"],
                "created_at": "2026-09-19T08:07:08.194152+00:00",
                "modified_at": null,
                "brand": "levis",
                "size": "28",
                "material": ["cotton"],
                "tags": null,
                "price": 70.00
            }];

            const expectedResult = [{
                "id": "wardrobe item id",
                "user_id": "user id",
                "image_url": "new image",
                "clothing_category": "jeans",
                "style": ["baggy"],
                "colour": ["denim blue"],
                "created_at": "2026-09-19T08:07:08.194152+00:00",
                "modified_at": null,
                "brand": "levis",
                "size": "28",
                "material": ["cotton"],
                "tags": ["everyday", "lightweight"],
                "price": 70.00
            }];

            // mock for get profile
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: getProfileMock, error: null })
                })
            } as any);

            // check item belongs to user
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        eq: jest.fn().mockReturnValueOnce({ data: oldRecord, error: null })
                    })
                })
            } as any);

            // mock updating the item
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                update: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        select: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                    })
                })
            } as any);

            expect(await wardrobeService.updateItemDetails(updateWardrobeItemDto, user_id)).toBe(expectedResult);
        });

        it('HttpException when trying to update record', async () => {
            const user_id = "user id";

            const getProfileMock = [{
                "id": "profile id",
                "display_name": "user",
                "body_type": null,
                "size": "M",
                "created_at": "time",
                "onboarding_completed": false,
                "onboarding_completed_at": null
            }];

            const updateWardrobeItemDto: UpdateWardrobeItemDto = {
                id: "wardrobe item id",
                image_url: "new image",
                clothing_category: "jeans",
                style: ["baggy"],
                brand: "levis",
                size: "28",
                colour: ["denim blue"],
                material: ["cotton"],
                tags: ["everyday", "lightweight"],
                modified_at: new Date(2026, 10, 6),
                price: 70.00
            }

            const oldRecord = [{
                "id": "wardrobe item id",
                "user_id": "user id",
                "image_url": "image",
                "clothing_category": "jeans",
                "style": ["baggy"],
                "colour": ["blue"],
                "created_at": "2026-09-19T08:07:08.194152+00:00",
                "modified_at": null,
                "brand": "levis",
                "size": "28",
                "material": ["cotton"],
                "tags": null,
                "price": 70.00
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

            // check item belongs to user
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        eq: jest.fn().mockReturnValueOnce({ data: oldRecord, error: null })
                    })
                })
            } as any);

            // mock updating the item
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                update: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        select: jest.fn().mockReturnValueOnce({ data: [], error: errorMock })
                    })
                })
            } as any);

            await expect(wardrobeService.updateItemDetails(updateWardrobeItemDto, user_id)).rejects.toThrow(HttpException);
        });
    });

    describe('Delete Item from Wardrobe', () => {
        it('successfully deleted wardrobe item', async () => {
            const id = "wardrobe item id";
            const user_id = "user id";

            const getProfileMock = [{
                "id": "profile id",
                "display_name": "user",
                "body_type": null,
                "size": "M",
                "created_at": "time",
                "onboarding_completed": false,
                "onboarding_completed_at": null
            }];

            const oldRecord = [{
                "id": "wardrobe item id",
                "user_id": "user id",
                "image_url": "image",
                "clothing_category": "jeans",
                "style": ["baggy"],
                "colour": ["blue"],
                "created_at": "2026-09-19T08:07:08.194152+00:00",
                "modified_at": null,
                "brand": "levis",
                "size": "28",
                "material": ["cotton"],
                "tags": null,
                "price": 70.00
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

            // check item belongs to user
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ 
                        eq: jest.fn().mockReturnValueOnce({ data: oldRecord, error: null })
                    })
                })
            } as any);

            // mock delete the item
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                delete: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce(expectedResult)
                })
            } as any);

            expect(await wardrobeService.deleteItem(id, user_id)).toBe(expectedResult);
        });
    });
});