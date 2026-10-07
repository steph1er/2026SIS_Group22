import { Test } from '@nestjs/testing';
import { OutfitsController } from '../outfits.controller';
import { OutfitsService } from '../outfits.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { OutfitWithItems } from '../interfaces/outfit-with-item.interface';
import { UpdateOutfitDto } from '../dto/update-outfit.dto';
import { CreateOutfitDto } from '../dto/create-outfit.dto';
import { OutfitBuilderTab } from '../interfaces/outfit-builder-tab.interface';
import { GetOutfitBuilderItemsDto } from '../dto/get-outfit-builder-items.dto';
import { User } from '@supabase/supabase-js';

describe('OutfitsController', () => {
  let outfitsController: OutfitsController;
  let outfitsService: OutfitsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OutfitsController],
      providers: [
        {
          provide: OutfitsService,
          useValue: {
            getOutfits: jest.fn(),
            getOutfit: jest.fn(),
            getWardrobeForBuilder: jest.fn(),
            getWishlistForBuilder: jest.fn(),
            createOutfit: jest.fn(),
            updateOutfit: jest.fn(),
            deleteOutfit: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    outfitsService = moduleRef.get(OutfitsService);
    outfitsController = moduleRef.get(OutfitsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Outfits', () => {
    it('successfully returns all outfits', async () => {
      const expectedResult = [
        {
          id: 'outfit id',
          user_id: 'user id',
          name: 'Autumn Outfit',
          occasion: null,
          style: 'casual',
          season: 'autumn',
          created_at: '2026-09-29 00:37:42.147028+00',
          modified_at: '2026-09-29 00:45:36.522499+00',
          outfit_items: [
            {
              id: 'outfit item id',
              outfit_id: 'outfit id',
              created_at: '2026-09-29 00:37:42.147028+00',
              wardrobe_items_id: 'wardrobe item id',
              catalogue_items_id: null,
            },
            {
              id: 'outfit item id 2',
              outfit_id: 'outfit id',
              created_at: '2026-09-29 00:37:42.147028+00',
              wardrobe_items_id: null,
              catalogue_items_id: 'catalogue item id',
            },
          ],
        },
        {
          id: 'outfit id 2',
          user_id: 'user id',
          name: 'My Outfit',
          occasion: null,
          style: 'y2k',
          season: null,
          created_at: '2026-09-28 15:19:13.470352+00',
          modified_at: '2026-09-28 15:19:13.470352+00',
          outfit_items: [
            {
              id: 'outfit item id 3',
              outfit_id: 'outfit id 2',
              created_at: '2026-09-28 15:19:13.470352+00',
              wardrobe_items_id: 'wardrobe item id 2',
              catalogue_items_id: null,
            },
          ],
        },
      ];

      jest
        .spyOn(outfitsService, 'getOutfits')
        .mockResolvedValueOnce(expectedResult as unknown as OutfitWithItems[]);

      const mockUser = { id: 'user id' };

      expect(await outfitsController.getOutfits(mockUser as User)).toBe(
        expectedResult,
      );
    });
  });

  describe('Get an outfit by id', () => {
    it('successfully returns the matching outfit', async () => {
      const id = 'outfit id';

      const expectedResult = [
        {
          id: 'outfit id',
          user_id: 'user id',
          name: 'My Outfit',
          occasion: null,
          style: 'y2k',
          season: null,
          created_at: '2026-09-28 15:19:13.470352+00',
          modified_at: '2026-09-28 15:19:13.470352+00',
          outfit_items: [
            {
              id: 'outfit item id 3',
              outfit_id: 'outfit id',
              created_at: '2026-09-28 15:19:13.470352+00',
              wardrobe_items_id: 'wardrobe item id 2',
              catalogue_items_id: null,
            },
          ],
        },
      ];

      jest
        .spyOn(outfitsService, 'getOutfit')
        .mockResolvedValueOnce(expectedResult as unknown as OutfitWithItems);

      const mockUser = { id: 'user id' };

      expect(await outfitsController.getOutfit(id, mockUser as User)).toBe(
        expectedResult,
      );
    });
  });

  describe('Update Outfit', () => {
    it('successfully updates the matching outfit', async () => {
      const id = 'outfit id';

      const mockUpdateOutfitDto: UpdateOutfitDto = {
        season: 'spring',
        items: [
          {
            wardrobe_items_id: 'wardrobe item id',
          },
          {
            catalogue_items_id: 'catalogue item id',
          },
        ],
      };

      const expectedResult = [
        {
          id: 'outfit id',
          user_id: 'user id',
          name: null,
          occasion: null,
          style: null,
          season: 'spring',
          created_at: '2026-09-28 15:19:13.470352+00',
          modified_at: '2026-09-28 15:25:13.470352+00',
          outfit_items: [
            {
              id: 'outfit item id 3',
              outfit_id: 'outfit id',
              created_at: '2026-09-28 15:25:13.470352+00',
              wardrobe_items_id: 'wardrobe item id',
              catalogue_items_id: null,
            },
            {
              id: 'outfit item id 4',
              outfit_id: 'outfit id',
              created_at: '2026-09-28 15:25:13.470352+00',
              wardrobe_items_id: null,
              catalogue_items_id: 'catalogue item id',
            },
          ],
        },
      ];

      jest
        .spyOn(outfitsService, 'updateOutfit')
        .mockResolvedValueOnce(expectedResult as unknown as OutfitWithItems);

      const mockUser = { id: 'user id' };

      expect(
        await outfitsController.updateOutfit(
          id,
          mockUpdateOutfitDto,
          mockUser as User,
        ),
      ).toBe(expectedResult);
    });
  });

  describe('Create Outfit', () => {
    it('successfully creates an outfit', async () => {
      const mockCreateOutfitDto: CreateOutfitDto = {
        name: 'My Outfit',
        occasion: 'night out',
        style: 'classic',
        season: 'winter',
        items: [
          {
            wardrobe_items_id: 'wardrobe item id',
          },
        ],
      };

      const expectedResult = [
        {
          id: 'outfit id',
          user_id: 'user id',
          name: 'My Outfit',
          occasion: 'night out',
          style: 'classic',
          season: 'winter',
          created_at: '2026-09-28 15:19:13.470352+00',
          modified_at: '2026-09-28 15:19:13.470352+00',
          outfit_items: [
            {
              id: 'outfit item id',
              outfit_id: 'outfit id',
              created_at: '2026-09-28 15:19:13.470352+00',
              wardrobe_items_id: 'wardrobe item id',
              catalogue_items_id: null,
            },
          ],
        },
      ];
      jest
        .spyOn(outfitsService, 'createOutfit')
        .mockResolvedValueOnce(expectedResult as unknown as OutfitWithItems);

      const mockUser = { id: 'user id' };

      expect(
        await outfitsController.createOutfit(
          mockCreateOutfitDto,
          mockUser as User,
        ),
      ).toBe(expectedResult);
    });
  });

  describe('Get Wardrobe For Outfit Builder', () => {
    it('successfully returns recommended, and all other, wardrobe items', async () => {
      const mockGetOutfitBuilderItemsDto: GetOutfitBuilderItemsDto = {
        filter_category: 'bottoms',
      };

      const expectedResult = [
        {
          recommendations: [
            {
              id: 'wardrobe item id',
              user_id: 'user id',
              image_url: 'image',
              clothing_category: 'jeans',
              style: ['baggy', 'everyday'],
              colour: ['blue'],
              created_at: '2026-09-19T08:06:15.657186+00:00',
              modified_at: '2026-09-14T16:03:00+00:00',
              brand: 'levis',
              size: 'M',
              material: ['cotton'],
              tags: [],
              price: 70,
            },
            {
              id: 'wardrobe item id 2',
              user_id: 'user id',
              image_url: 'image',
              clothing_category: 'pants',
              style: ['casual'],
              colour: ['brown'],
              created_at: '2026-09-19T08:06:15.657186+00:00',
              modified_at: '2026-09-14T16:03:00+00:00',
              brand: null,
              size: null,
              material: null,
              tags: null,
              price: null,
            },
          ],
          items: [
            {
              id: 'wardrobe item id 3',
              user_id: 'user id',
              image_url: 'image',
              clothing_category: 'skirt',
              style: ['sportswear'],
              colour: ['black'],
              created_at: '2026-09-19T08:06:15.657186+00:00',
              modified_at: '2026-09-14T16:03:00+00:00',
              brand: 'nike',
              size: 'M',
              material: null,
              tags: null,
              price: 25,
            },
          ],
        },
      ];

      jest
        .spyOn(outfitsService, 'getWardrobeForBuilder')
        .mockResolvedValueOnce(expectedResult as unknown as OutfitBuilderTab);

      const mockUser = { id: 'user id' };

      expect(
        await outfitsController.getWardrobeForBuilder(
          mockGetOutfitBuilderItemsDto,
          mockUser as User,
        ),
      ).toBe(expectedResult);
    });
  });

  describe('Get Wishlist For Outfit Builder', () => {
    it('successfully returns recommended, and all other, wishlist items', async () => {
      const mockGetOutfitBuilderItemsDto: GetOutfitBuilderItemsDto = {
        filter_category: 'tops',
      };

      const expectedResult = [
        {
          recommendations: [
            {
              wishlist_id: 'wishlist id',
              id: 'catalogue item id',
              price: '20',
              style: ['Halter', 'Scoop Neck'],
              colour: ['Brown'],
              brand_id: 'brand id',
              category: 'Tops',
              image_url: 'image url',
              item_name: 'Everyday Smooth Scoop Halter',
              materials: ['Cotton', 'Elastane'],
              created_at: '2026-09-19T08:06:15.657186+00:00',
              product_url: 'product url',
              available_sizes: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
            },
          ],
          items: [
            {
              wishlist_id: 'wishlist id',
              id: 'catalogue item id 2',
              price: '240',
              style: ['Polo Collar', 'Ribbed Cuffs', 'Cropped', 'Releaxed Fit'],
              colour: ['White'],
              brand_id: 'brand id',
              category: 'Jumpers',
              image_url: 'image url',
              item_name: 'Dalton Polo Jumper Off White',
              materials: ['Wool', 'Polyamide'],
              created_at: '2026-09-19T08:06:15.657186+00:00',
              product_url: 'product url',
              available_sizes: ['6', '8', '10', '12'],
            },
          ],
        },
      ];

      jest
        .spyOn(outfitsService, 'getWishlistForBuilder')
        .mockResolvedValueOnce(expectedResult as unknown as OutfitBuilderTab);

      const mockUser = { id: 'user id' };

      expect(
        await outfitsController.getWishlistForBuilder(
          mockGetOutfitBuilderItemsDto,
          mockUser as User,
        ),
      ).toBe(expectedResult);
    });
  });

  describe('Delete Outfit', () => {
    it('successfully deletes the matching outfit and returns nothing', async () => {
      const id = 'outfit id';

      const mockUser = { id: 'user id' };

      jest
        .spyOn(outfitsService, 'deleteOutfit')
        .mockResolvedValueOnce(undefined);

      expect(await outfitsController.deleteOutfit(id, mockUser as User)).toBe(
        undefined,
      );
    });
  });
});
