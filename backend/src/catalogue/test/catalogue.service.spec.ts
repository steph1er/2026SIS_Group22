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
                            limit: jest.fn()
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
});