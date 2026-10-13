import { Test } from "@nestjs/testing";
import { SupabaseService } from "../../supabase/supabase.service";
import { CatalogueService } from "../catalogue.service";
import { HttpException, NotFoundException } from "@nestjs/common";

describe('CatalogueService', () => {
    let catalogueService: CatalogueService;
    let supabaseClient: SupabaseService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                CatalogueService,
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
                            limit: jest.fn(),
                            not: jest.fn(),
                            order: jest.fn(),
                            range: jest.fn(),
                            rpc: jest.fn()
                        }
                    }
                }
            ]
        })
        .compile();

        catalogueService = moduleRef.get(CatalogueService);
        supabaseClient = moduleRef.get(SupabaseService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Search Catalogue', () => {
        it('should return all items matching search criteria', async () => {
            const item_name = "jeans";
            const clothingcategory = ['jeans'];
            const style = ['baggy'];
            const brand = ['levis'];
            const size = ['M'];
            const colour = ['blue'];
            const material = ['cotton'];
            const min_price = 20;
            const max_price = 80;

            const expectedResult = [{
                "id": "catalogue item id",
                "item_name": "jeans",
                "image_url": "image",
                "product_url": "url",
                "clothing_category": "jeans",
                "style": ['baggy', 'everyday'],
                "avaliable_sizes": ['S', 'M', 'L', 'XL'],
                "colour": ['blue'],
                "brand_id": "brand id",
                "material": ['cotton'],
                "created_at": "2026-09-19T08:06:15.657186+00:00",
                "price": 70
            }];

            // mock search
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    ilike: jest.fn().mockReturnValueOnce({ 
                        or: jest.fn().mockReturnValueOnce({
                            overlaps: jest.fn().mockReturnValueOnce({
                                or: jest.fn().mockReturnValueOnce({
                                    overlaps: jest.fn().mockReturnValueOnce({
                                        overlaps: jest.fn().mockReturnValueOnce({
                                                overlaps: jest.fn().mockReturnValueOnce({
                                                    lte: jest.fn().mockReturnValueOnce({ 
                                                        gte: jest.fn().mockReturnValueOnce({ 
                                                            limit: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
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

            expect(await catalogueService.searchCatalogueItems(item_name, 
                clothingcategory, 
                style,
                brand,
                size,
                colour,
                material,
                min_price,
                max_price)).toBe(expectedResult);
        });

        it('http exception', async () => {
            const item_name = "jeans";
            const clothingcategory = ['jeans'];
            const style = ['baggy'];
            const brand = ['levis'];
            const size = ['M'];
            const colour = ['blue'];
            const material = ['cotton'];
            const min_price = 20;
            const max_price = 80;

            const errorMock = {
                code: "error code",
                details: "error details",
                hint: "hint to solve error",
                message: "error message"
            };

            // mock search
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    ilike: jest.fn().mockReturnValueOnce({ 
                        or: jest.fn().mockReturnValueOnce({
                            overlaps: jest.fn().mockReturnValueOnce({
                                or: jest.fn().mockReturnValueOnce({
                                    overlaps: jest.fn().mockReturnValueOnce({
                                        overlaps: jest.fn().mockReturnValueOnce({
                                                overlaps: jest.fn().mockReturnValueOnce({
                                                    lte: jest.fn().mockReturnValueOnce({ 
                                                        gte: jest.fn().mockReturnValueOnce({ 
                                                            limit: jest.fn().mockReturnValueOnce({ data: [], error: errorMock })
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

            await expect(catalogueService.searchCatalogueItems(item_name, 
                clothingcategory, 
                style,
                brand,
                size,
                colour,
                material,
                min_price,
                max_price)).rejects.toThrow(HttpException);
        });

        it('Not Found Exception', async () => {
            const item_name = "jeans";
            const clothingcategory = ['jeans'];
            const style = ['baggy'];
            const brand = ['levis'];
            const size = ['M'];
            const colour = ['blue'];
            const material = ['cotton'];
            const min_price = 20;
            const max_price = 80;

            // mock search
            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    ilike: jest.fn().mockReturnValueOnce({ 
                        or: jest.fn().mockReturnValueOnce({
                            overlaps: jest.fn().mockReturnValueOnce({
                                or: jest.fn().mockReturnValueOnce({
                                    overlaps: jest.fn().mockReturnValueOnce({
                                        overlaps: jest.fn().mockReturnValueOnce({
                                                overlaps: jest.fn().mockReturnValueOnce({
                                                    lte: jest.fn().mockReturnValueOnce({ 
                                                        gte: jest.fn().mockReturnValueOnce({ 
                                                            limit: jest.fn().mockReturnValueOnce({ data: [], error: null })
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

            await expect(catalogueService.searchCatalogueItems(item_name, 
                clothingcategory, 
                style,
                brand,
                size,
                colour,
                material,
                min_price,
                max_price)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Catalogue Item by ID', () => {
        it('successfully get catalogue item', async () => {
            const id = "catalogue item id";

            const expectedResult = [{
                "id": "catalogue item id",
                "item_name": "jeans",
                "image_url": "image",
                "product_url": "url",
                "clothing_category": "jeans",
                "style": ['baggy', 'everyday'],
                "avaliable_sizes": ['S', 'M', 'L', 'XL'],
                "colour": ['blue'],
                "brand_id": "brand id",
                "material": ['cotton'],
                "created_at": "2026-09-19T08:06:15.657186+00:00",
                "price": 70
            }];

            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                })
            } as any);

            expect(await catalogueService.getCatalogueItem(id)).toBe(expectedResult);
        });

        it('HttpException when issue with database', async () => {
            const id = "catalogue item id";

            const errorMock = {
                code: "error code",
                details: "error details",
                hint: "hint to solve error",
                message: "error message"
            };

            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [], error: errorMock })
                })
            } as any);

            await expect(catalogueService.getCatalogueItem(id)).rejects.toThrow(HttpException);
        });

        it('NotFoundException when no matching item', async () => {
            const id = "catalogue item id";

            jest.spyOn(supabaseClient.client, 'from').mockReturnValueOnce({
                select: jest.fn().mockReturnValueOnce({
                    eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                })
            } as any);

            await expect(catalogueService.getCatalogueItem(id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Catalogue Reccomendations', () => {
        const profileMock = [{ id: 'profile id' }];
        const expectedResult = [{
            "id": "catalogue item id",
            "item_name": "jeans",
            "image_url": "image",
            "category": "jeans",
            "style": ['baggy'],
            "colour": ['blue'],
            "brand_id": "brand id",
            "materials": ['cotton'],
            "created_at": "2026-09-19T08:06:15.657186+00:00",
            "price": 70
        }];

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('cold start: falls back to fixed-order feed when there is no wardrobe or onboarding data', async () => {
            jest.spyOn(supabaseClient.client, 'from')
                // get_profile_id
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                // get_onboarding - no onboarding row yet
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                // wishlist
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                // wardrobe_items - no embeddings
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            not: jest.fn().mockReturnValueOnce({ data: [], error: null })
                        })
                    })
                } as any)
                // fallback: catalogue_items fixed order feed
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        order: jest.fn().mockReturnValueOnce({
                            order: jest.fn().mockReturnValueOnce({
                                range: jest.fn().mockReturnValueOnce({ data: expectedResult, error: null })
                            })
                        })
                    })
                } as any);

            const result = await catalogueService.getCatalogueReccomendations('auth id', 20, 0);

            expect(result).toBe(expectedResult);
        });

        it('cold start: NotFoundException when the fixed-order feed has nothing left', async () => {
            jest.spyOn(supabaseClient.client, 'from')
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            not: jest.fn().mockReturnValueOnce({ data: [], error: null })
                        })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        order: jest.fn().mockReturnValueOnce({
                            order: jest.fn().mockReturnValueOnce({
                                range: jest.fn().mockReturnValueOnce({ data: [], error: null })
                            })
                        })
                    })
                } as any);

            await expect(catalogueService.getCatalogueReccomendations('auth id', 20, 0))
                .rejects.toThrow(NotFoundException);
        });

        it('ranks by similarity to the wardrobe embedding average when there is no onboarding data', async () => {
            const rpcMock = jest.spyOn(supabaseClient.client, 'rpc').mockReturnValueOnce({ data: expectedResult, error: null } as any);

            jest.spyOn(supabaseClient.client, 'from')
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                // wardrobe_items has one item, already a unit vector
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            not: jest.fn().mockReturnValueOnce({ data: [{ embedding: [1, 0, 0] }], error: null })
                        })
                    })
                } as any);

            const result = await catalogueService.getCatalogueReccomendations('auth id', 20, 0);

            expect(result).toBe(expectedResult);
            expect(rpcMock).toHaveBeenCalledWith('match_catalogue_items', expect.objectContaining({
                query_embedding: [1, 0, 0],
                match_categories: null,
                exclude_styles: [],
                exclude_ids: [],
                match_limit: 20,
                match_offset: 0,
            }));
        });

        it('ranks by similarity to onboarding preferences, and hard-excludes style_no_gos and wishlisted items', async () => {
            const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => ({ embedding: [0, 1, 0] }),
            } as any);
            const rpcMock = jest.spyOn(supabaseClient.client, 'rpc').mockReturnValueOnce({ data: expectedResult, error: null } as any);

            jest.spyOn(supabaseClient.client, 'from')
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            data: [{
                                primary_aesthetic: 'minimalist',
                                style_keywords: ['casual'],
                                colour_preferences: ['black'],
                                fashion_outlook: [],
                                style_no_gos: ['Goth'],
                            }],
                            error: null,
                        })
                    })
                } as any)
                // wishlist already has one saved item
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            data: [{ catalogue_item_id: 'saved-1' }],
                            error: null,
                        })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            not: jest.fn().mockReturnValueOnce({ data: [], error: null })
                        })
                    })
                } as any);

            const result = await catalogueService.getCatalogueReccomendations('auth id', 20, 0);

            expect(result).toBe(expectedResult);
            expect(fetchMock).toHaveBeenCalled();
            expect(rpcMock).toHaveBeenCalledWith('match_catalogue_items', expect.objectContaining({
                query_embedding: [0, 1, 0],
                exclude_styles: ['goth'],
                exclude_ids: ['saved-1'],
            }));
        });

        it('maps a canonical filter category (e.g. "tops") to the matching raw catalogue categories', async () => {
            const rpcMock = jest.spyOn(supabaseClient.client, 'rpc').mockReturnValueOnce({ data: expectedResult, error: null } as any);

            jest.spyOn(supabaseClient.client, 'from')
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            not: jest.fn().mockReturnValueOnce({ data: [{ embedding: [1, 0, 0] }], error: null })
                        })
                    })
                } as any);

            await catalogueService.getCatalogueReccomendations('auth id', 5, 0, 'tops');

            const match_categories = rpcMock.mock.calls[0][1].match_categories;
            expect(match_categories).toEqual(expect.arrayContaining(['top', 'tops', 'shirt', 'hoodie']));
            expect(match_categories).not.toEqual(expect.arrayContaining(['jeans']));
        });

        it('NotFoundException when similarity search has nothing left to recommend', async () => {
            jest.spyOn(supabaseClient.client, 'rpc').mockReturnValueOnce({ data: [], error: null } as any);

            jest.spyOn(supabaseClient.client, 'from')
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            not: jest.fn().mockReturnValueOnce({ data: [{ embedding: [1, 0, 0] }], error: null })
                        })
                    })
                } as any);

            await expect(catalogueService.getCatalogueReccomendations('auth id', 20, 0))
                .rejects.toThrow(NotFoundException);
        });

        it('HttpException when the wishlist lookup fails', async () => {
            const errorMock = {
                code: "error code",
                details: "error details",
                hint: "hint to solve error",
                message: "error message"
            };

            jest.spyOn(supabaseClient.client, 'from')
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: errorMock })
                    })
                } as any);

            await expect(catalogueService.getCatalogueReccomendations('auth id', 20, 0))
                .rejects.toThrow(HttpException);
        });

        it('HttpException when similarity search itself fails', async () => {
            const errorMock = {
                code: "error code",
                details: "error details",
                hint: "hint to solve error",
                message: "error message"
            };
            jest.spyOn(supabaseClient.client, 'rpc').mockReturnValueOnce({ data: [], error: errorMock } as any);

            jest.spyOn(supabaseClient.client, 'from')
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: profileMock, error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({ data: [], error: null })
                    })
                } as any)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValueOnce({
                        eq: jest.fn().mockReturnValueOnce({
                            not: jest.fn().mockReturnValueOnce({ data: [{ embedding: [1, 0, 0] }], error: null })
                        })
                    })
                } as any);

            await expect(catalogueService.getCatalogueReccomendations('auth id', 20, 0))
                .rejects.toThrow(HttpException);
        });
    });
});