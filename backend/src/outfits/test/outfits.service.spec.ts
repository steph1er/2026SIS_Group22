import { Test } from '@nestjs/testing';
import { SupabaseService } from '../../supabase/supabase.service';
import { OutfitsService } from '../outfits.service';
import { HttpException, NotFoundException, HttpStatus } from '@nestjs/common';
import {
  FilterCategory,
  resolveFilterGroup,
} from '../../common/constants/filter-category.constant';
import { UpdateOutfitDto } from '../dto/update-outfit.dto';
import { OutfitWithItems } from '../interfaces/outfit-with-item.interface';

const expectHttpException = async (
  promise: Promise<unknown>,
  status: HttpStatus,
  message: string,
) => {
  const error = await promise.then(
    () => {
      throw new Error('Expected promise to reject, but it resolved');
    },
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(HttpException);
  expect((error as HttpException).getStatus()).toBe(status);
  expect((error as HttpException).message).toBe(message);
};

jest.mock('../../common/constants/filter-category.constant', () => ({
  ...jest.requireActual('../../common/constants/filter-category.constant'),
  resolveFilterGroup: jest.fn(),
}));

describe('OutfitsService', () => {
  let outfitsService: OutfitsService;
  let supabaseClient: SupabaseService;

  const mockSelectEq = (data: unknown, error: unknown = null) => {
    const eq = jest.fn().mockResolvedValue({ data, error });
    const select = jest.fn().mockReturnValue({ eq });
    jest
      .spyOn(supabaseClient.client, 'from')
      .mockReturnValueOnce({ select } as any);
    return { select, eq };
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OutfitsService,
        {
          provide: SupabaseService,
          useValue: {
            client: {
              from: jest.fn(),
              select: jest.fn(),
              eq: jest.fn(),
              insert: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    outfitsService = moduleRef.get(OutfitsService);
    supabaseClient = moduleRef.get(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Outfits', () => {
    const authId = 'user id';

    it('successfully returns all outfits for the user', async () => {
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
          ],
        },
      ];

      const query = mockSelectEq(expectedResult);

      const result = await outfitsService.getOutfits(authId);

      expect(result).toEqual(expectedResult);
      expect(supabaseClient.client.from).toHaveBeenCalledWith('outfits');
      expect(query.select).toHaveBeenCalledWith(
        '*, outfit_items(*, wardrobe_items(*), catalogue_items(*))',
      );
      expect(query.eq).toHaveBeenCalledWith('user_id', authId);
    });

    it('throws a 500 when the database returns an error', async () => {
      mockSelectEq(null, {
        code: 'error code',
        details: 'error details',
        hint: 'hint to solve error',
        message: 'error message',
      });

      await expectHttpException(
        outfitsService.getOutfits(authId),
        HttpStatus.INTERNAL_SERVER_ERROR,
        'error message',
      );
    });

    it('throws a 404 when the user has no outfits', async () => {
      mockSelectEq([]);

      await expectHttpException(
        outfitsService.getOutfits(authId),
        HttpStatus.NOT_FOUND,
        'No outfits found for current user',
      );
    });
  });

  describe('Get Wardrobe For Builder', () => {
    const AUTH_ID = 'auth user id';
    const PROFILE_ID = 'profile id';

    const categoryGroups: Record<string, string> = {
      'T-Shirt': 'tops',
      Hoodie: 'tops',
      Jeans: 'bottoms',
    };

    const BOTTOMS = 'bottoms' as FilterCategory;

    const wardrobeItem = (id: string, clothing_category: string) => ({
      id,
      user_id: PROFILE_ID,
      clothing_category,
    });

    const makeTops = (count: number) =>
      Array.from({ length: count }, (_, i) =>
        wardrobeItem(`top ${i + 1}`, 'T-Shirt'),
      );

    beforeEach(() => {
      (resolveFilterGroup as jest.Mock).mockImplementation(
        (category: string) => categoryGroups[category],
      );
    });

    it('looks up the profile, then queries wardrobe items by profile id', async () => {
      const profile = mockSelectEq([{ id: PROFILE_ID }]);
      const wardrobe = mockSelectEq([]);

      await outfitsService.getWardrobeForBuilder('tops', AUTH_ID);

      expect(supabaseClient.client.from).toHaveBeenNthCalledWith(1, 'profiles');
      expect(supabaseClient.client.from).toHaveBeenNthCalledWith(
        2,
        'wardrobe_items',
      );
      expect(profile.eq).toHaveBeenCalledWith('user_id', AUTH_ID);
      expect(wardrobe.select).toHaveBeenCalledWith('*');
      expect(wardrobe.eq).toHaveBeenCalledWith('user_id', PROFILE_ID);
    });

    describe('category filtering', () => {
      const top1 = wardrobeItem('top 1', 'T-Shirt');
      const jeans1 = wardrobeItem('jeans 1', 'Jeans');
      const top2 = wardrobeItem('top 2', 'T-Shirt');
      const hoodie = wardrobeItem('hoodie 1', 'Hoodie');
      const jeans2 = wardrobeItem('jeans 2', 'Jeans');
      const allItems = [top1, jeans1, top2, hoodie, jeans2];

      it.each([
        ['tops' as FilterCategory, [top1, top2, hoodie]],
        [BOTTOMS, [jeans1, jeans2]],
      ])(
        'only includes items in the "%s" group',
        async (category, expected) => {
          mockSelectEq([{ id: PROFILE_ID }]);
          mockSelectEq(allItems);

          const result = await outfitsService.getWardrobeForBuilder(
            category,
            AUTH_ID,
          );

          expect(result).toEqual({ recommendations: expected, items: [] });
        },
      );

      it("defaults to 'tops' when no category is given", async () => {
        mockSelectEq([{ id: PROFILE_ID }]);
        mockSelectEq(allItems);

        const result = await outfitsService.getWardrobeForBuilder(
          undefined,
          AUTH_ID,
        );

        expect(result.recommendations).toEqual([top1, top2, hoodie]);
      });

      it('returns empty lists, not an error, when nothing matches the category', async () => {
        mockSelectEq([{ id: PROFILE_ID }]);
        mockSelectEq([top1, top2]);

        const result = await outfitsService.getWardrobeForBuilder(
          BOTTOMS,
          AUTH_ID,
        );

        expect(result).toEqual({ recommendations: [], items: [] });
      });

      it('treats null data as an empty wardrobe', async () => {
        mockSelectEq([{ id: PROFILE_ID }]);
        mockSelectEq(null);

        const result = await outfitsService.getWardrobeForBuilder(
          'tops',
          AUTH_ID,
        );

        expect(result).toEqual({ recommendations: [], items: [] });
      });
    });

    describe('recommendations split', () => {
      it('puts the first 10 items in recommendations and the rest in items, preserving order', async () => {
        const tops = makeTops(12);
        mockSelectEq([{ id: PROFILE_ID }]);
        mockSelectEq(tops);

        const result = await outfitsService.getWardrobeForBuilder(
          'tops',
          AUTH_ID,
        );

        expect(result.recommendations).toEqual(tops.slice(0, 10));
        expect(result.items).toEqual(tops.slice(10));
      });

      it('puts everything in recommendations when there are 10 or fewer items', async () => {
        const tops = makeTops(10);
        mockSelectEq([{ id: PROFILE_ID }]);
        mockSelectEq(tops);

        const result = await outfitsService.getWardrobeForBuilder(
          'tops',
          AUTH_ID,
        );

        expect(result.recommendations).toEqual(tops);
        expect(result.items).toEqual([]);
      });
    });

    describe('errors', () => {
      const dbError = {
        code: 'error code',
        details: 'error details',
        hint: 'hint',
        message: 'error message',
      };

      it('throws a 500 when the profile lookup fails', async () => {
        mockSelectEq(null, dbError);

        await expectHttpException(
          outfitsService.getWardrobeForBuilder('tops', AUTH_ID),
          HttpStatus.INTERNAL_SERVER_ERROR,
          'error message',
        );
        expect(supabaseClient.client.from).toHaveBeenCalledTimes(1);
      });

      it('throws a 404 when the user has no profile', async () => {
        mockSelectEq([]);

        await expectHttpException(
          outfitsService.getWardrobeForBuilder('tops', AUTH_ID),
          HttpStatus.NOT_FOUND,
          'No user found',
        );
        // the wardrobe table is never queried
        expect(supabaseClient.client.from).toHaveBeenCalledTimes(1);
      });

      it('throws a 500 when the wardrobe query fails', async () => {
        mockSelectEq([{ id: PROFILE_ID }]);
        mockSelectEq(null, dbError);

        await expectHttpException(
          outfitsService.getWardrobeForBuilder('tops', AUTH_ID),
          HttpStatus.INTERNAL_SERVER_ERROR,
          'error message',
        );
      });
    });
  });

  describe('Update Outfit', () => {
    const AUTH_ID = 'auth user id';
    const OUTFIT_ID = 'outfit id';

    const updatedOutfit = {
      id: OUTFIT_ID,
      user_id: AUTH_ID,
      name: 'New name',
      occasion: null,
      style: 'casual',
      season: 'spring',
      created_at: '2026-09-28T15:19:13.470352+00:00',
      modified_at: '2026-09-28T15:25:13.470352+00:00',
      outfit_items: [],
    } as unknown as OutfitWithItems;

    beforeEach(() => {
      jest.spyOn(outfitsService, 'getOutfit').mockResolvedValue(updatedOutfit);
    });

    it('updates only the provided fields, then returns the refreshed outfit', async () => {
      const dto = { name: 'New name', season: 'spring' } as UpdateOutfitDto;

      const from = jest.spyOn(supabaseClient.client, 'from');

      const secondEq = jest
        .fn()
        .mockResolvedValue({ data: [{ id: OUTFIT_ID }], error: null });
      const firstEq = jest.fn().mockReturnValue({ eq: secondEq });
      from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ eq: firstEq }),
      } as any);

      const updateEq = jest.fn().mockResolvedValue({ error: null });
      const update = jest.fn().mockReturnValue({ eq: updateEq });
      from.mockReturnValueOnce({ update } as any);

      const result = await outfitsService.updateOutfit(OUTFIT_ID, dto, AUTH_ID);

      expect(from).toHaveBeenCalledTimes(2);
      expect(from).toHaveBeenNthCalledWith(1, 'outfits');
      expect(from).toHaveBeenNthCalledWith(2, 'outfits');

      expect(firstEq).toHaveBeenCalledWith('id', OUTFIT_ID);
      expect(secondEq).toHaveBeenCalledWith('user_id', AUTH_ID);

      expect(update.mock.calls[0][0]).toStrictEqual({
        name: 'New name',
        season: 'spring',
      });
      expect(updateEq).toHaveBeenCalledWith('id', OUTFIT_ID);

      expect(outfitsService.getOutfit).toHaveBeenCalledWith(OUTFIT_ID, AUTH_ID);
      expect(result).toBe(updatedOutfit);
    });
  });
});
