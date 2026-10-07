import { Test } from "@nestjs/testing";
import { SupabaseService } from "../../supabase/supabase.service";
import { WardrobeService } from "../wardrobe.service";
import { HttpException, NotFoundException } from "@nestjs/common";

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
                            gte: jest.fn()
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
});