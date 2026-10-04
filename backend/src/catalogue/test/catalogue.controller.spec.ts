import { Test } from "@nestjs/testing";
import { CatalogueController } from "../catalogue.controller";
import { CatalogueService } from "../catalogue.service";
import { SupabaseAuthGuard } from "../../auth/supabase-auth.guard";
import { SearchCatalogueItemDto } from "../dto/search-catalogue-item.dto";

describe('CatalogueContoller', () => {
    let catalogueContoller: CatalogueController;
    let catalogueService: CatalogueService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [CatalogueController],
            providers: [
                {
                    provide: CatalogueService,
                    useValue: {
                        searchCatalogueItems: jest.fn(),
                        getCatalogueItem: jest.fn()
                    }
                }
            ]
        })
        .overrideGuard(SupabaseAuthGuard)
        .useValue({ canActivate: () => true })
        .compile();

        catalogueService = moduleRef.get(CatalogueService);
        catalogueContoller = moduleRef.get(CatalogueController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Search Catalogue Items', () => {
        it('should return items in catalogue matching search', async () => {
            const mockSearchCatalogueItemDto: SearchCatalogueItemDto = {
                clothingcategory: ['jeans'],
                style: ['baggy'],
                brand: ['levis'],
                size: ['M'],
                colour: ['blue'],
                material: ['cotton'],
                min_price: 20,
                max_price: 80
            };

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

            jest.spyOn(catalogueService, 'searchCatalogueItems').mockResolvedValueOnce(expectedResult);

            expect(await catalogueContoller.searchCatalogueItems(mockSearchCatalogueItemDto)).toBe(expectedResult);
        });
    });

    describe('Get Catalogue Item by ID', () => {
        it('should return matching item', async () => {
            const id = "catalogue item id"

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

            jest.spyOn(catalogueService, 'getCatalogueItem').mockResolvedValueOnce(expectedResult);

            expect(await catalogueContoller.getCatalogueItem(id)).toBe(expectedResult);
        });
    });
});