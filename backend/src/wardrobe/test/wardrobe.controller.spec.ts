import { Test } from '@nestjs/testing';
import { WardrobeController } from '../wardrobe.controller';
import { WardrobeService } from '../wardrobe.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { PostgrestSingleResponse, User } from '@supabase/supabase-js';
import { UpdateWardrobeItemDto } from '../dto/update-wardrobe-item.dto';
import { SearchWardrobeItemDto } from '../dto/search-wardrobe-item.dto';

describe('WardrobeContoller', () => {
  let wardrobeContoller: WardrobeController;
  let wardrobeService: WardrobeService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WardrobeController],
      providers: [
        {
          provide: WardrobeService,
          useValue: {
            getWardrobe: jest.fn(),
            updateItemDetails: jest.fn(),
            searchForItems: jest.fn(),
            getWardrobeItem: jest.fn(),
            deleteItem: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    wardrobeService = moduleRef.get(WardrobeService);
    wardrobeContoller = moduleRef.get(WardrobeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Wardrobe', () => {
    it('should return all items in a wardrobe', async () => {
      const expectedResult = [
        {
          id: 'wardrobe item id',
          user_id: 'user id',
          image_url: 'image',
          clothing_category: 'shorts',
          style: ['exercise'],
          colour: ['black'],
          created_at: '2026-09-19T08:07:08.194152+00:00',
          modified_at: null,
          brand: 'lululemon',
          size: 'medium',
          material: ['nylon'],
          tags: null,
          price: 60.99,
        },
        {
          id: 'wardrobe item id 2',
          user_id: 'user id',
          image_url: 'image',
          clothing_category: 'top',
          style: ['basics', 'casual'],
          colour: ['white'],
          created_at: '2026-09-19T08:08:11.838639+00:00',
          modified_at: null,
          brand: 'cotton on',
          size: 'small',
          material: ['cotton'],
          tags: null,
          price: 19.99,
        },
      ];

      jest
        .spyOn(wardrobeService, 'getWardrobe')
        .mockResolvedValueOnce(expectedResult);

      const mockUser = { id: 'user id' };

      expect(await wardrobeContoller.getWardrobe(mockUser as User)).toBe(
        expectedResult,
      );
    });
  });

  describe('Update Wardrobe Item', () => {
    it('update an item in wardrobe successfully', async () => {
      const mockUpdateWardrobeItemDto: UpdateWardrobeItemDto = {
        id: 'wardrobe item id',
        clothing_category: 'jeans',
        style: ['baggy', 'everyday'],
        brand: 'levis',
        size: 'M',
        colour: ['blue'],
        material: ['cotton'],
        tags: [],
        modified_at: new Date(2026, 9, 30),
        price: 70,
      };

      const expectedResult = [
        {
          id: 'wardrobe item id',
          user_id: 'user id',
          image_url: 'image',
          clothing_category: 'jeans',
          style: ['baggy', 'everyday'],
          brand: 'levis',
          size: 'M',
          colour: ['blue'],
          material: ['cotton'],
          tags: [],
          created_at: '2026-09-19T08:06:15.657186+00:00',
          modified_at: '2026-09-14T16:03:00+00:00',
          price: 70,
        },
      ];

      jest
        .spyOn(wardrobeService, 'updateItemDetails')
        .mockResolvedValueOnce(expectedResult);

      const mockUser = { id: 'user id' };

      expect(
        await wardrobeContoller.updateItemDetails(
          mockUpdateWardrobeItemDto,
          mockUser as User,
        ),
      ).toBe(expectedResult);
    });
  });

  describe('Search for wardrobe items', () => {
    it('search returns matching item successfully', async () => {
      const mockSearchWardrobeItemDto: SearchWardrobeItemDto = {
        clothingcategory: ['jeans'],
        style: ['baggy'],
        brand: ['levis'],
        size: ['M'],
        colour: ['blue'],
        material: ['cotton'],
        tags: [],
        min_price: 20,
        max_price: 80,
      };

      const expectedResult = [
        {
          id: 'wardrobe item id',
          user_id: 'user id',
          image_url: 'image',
          clothing_category: 'jeans',
          style: ['baggy', 'everyday'],
          brand: 'levis',
          size: 'M',
          colour: ['blue'],
          material: ['cotton'],
          tags: [],
          created_at: '2026-09-19T08:06:15.657186+00:00',
          modified_at: '2026-09-14T16:03:00+00:00',
          price: 70,
        },
      ];

      jest
        .spyOn(wardrobeService, 'searchForItems')
        .mockResolvedValueOnce(expectedResult);

      const mockUser = { id: 'user id' };

      expect(
        await wardrobeContoller.searchForItems(
          mockSearchWardrobeItemDto,
          mockUser as User,
        ),
      ).toBe(expectedResult);
    });
  });

  describe('Get wardrobe item by id', () => {
    it('returns matching item successfully', async () => {
      const id = 'wardrobe item id';

      const expectedResult = [
        {
          id: 'wardrobe item id',
          user_id: 'user id',
          image_url: 'image',
          clothing_category: 'jeans',
          style: ['baggy', 'everyday'],
          brand: 'levis',
          size: 'M',
          colour: ['blue'],
          material: ['cotton'],
          tags: [],
          created_at: '2026-09-19T08:06:15.657186+00:00',
          modified_at: '2026-09-14T16:03:00+00:00',
          price: 70,
        },
      ];

      jest
        .spyOn(wardrobeService, 'getWardrobeItem')
        .mockResolvedValueOnce(expectedResult);

      const mockUser = { id: 'user id' };

      expect(
        await wardrobeContoller.getWardrobeItem(id, mockUser as User),
      ).toBe(expectedResult);
    });
  });

  describe('delete wardrobe item', () => {
    it('successfully deletes wardrobe item', async () => {
      const id = 'wardrobe item id';

      const expectedResult = {
        success: true,
        error: null,
        data: null,
        count: null,
        status: 204,
        statusText: 'No Content',
      };

      jest
        .spyOn(wardrobeService, 'deleteItem')
        .mockResolvedValueOnce(expectedResult as PostgrestSingleResponse<null>);

      const mockUser = { id: 'user id' };

      expect(await wardrobeContoller.deleteItem(id, mockUser as User)).toBe(
        expectedResult,
      );
    });
  });
});
