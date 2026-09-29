import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { CreateOutfitItemDto } from './dto/create-outfit-item.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';
import { OutfitWithItems } from './interfaces/outfit-with-item.interface';
import { Outfit } from './interfaces/outfit.interface';
import { OutfitBuilderTab } from './interfaces/outfit-builder-tab.interface';
import {
  FilterCategory,
  resolveFilterGroup,
} from '../common/constants/filter-category.constant';

type OutfitUpdateFields = Partial<
  Pick<Outfit, 'name' | 'occasion' | 'style' | 'season'>
>;

@Injectable()
export class OutfitsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOutfits(auth_id: string): Promise<OutfitWithItems[]> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('outfits')
      .select('*, outfit_items(*)')
      .eq('user_id', auth_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (data.length === 0) {
      throw new NotFoundException('No outfits found for current user');
    }

    return data;
  }

  async getOutfit(id: string, auth_id: string): Promise<OutfitWithItems> {
    const supabase = this.supabaseService.client;

    //return as a single object rather than array
    const { data, error } = await supabase
      .from('outfits')
      .select('*, outfit_items(*)')
      .eq('id', id)
      .eq('user_id', auth_id)
      .maybeSingle();

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!data) {
      throw new NotFoundException(
        'No outfit found for specified outfit id for current user',
      );
    }

    return data;
  }

  //gets recommended and all other wardrobe items for outfit-builder page
  async getWardrobeForBuilder(
    filter_category: FilterCategory = 'tops',
    auth_id: string,
  ): Promise<OutfitBuilderTab> {
    const supabase = this.supabaseService.client;

    const profile_id = await this.get_profile_id(auth_id);

    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', profile_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //filter data according to provided filter category, otherwise default is 'tops'
    const filtered = (data ?? []).filter(
      (item) => resolveFilterGroup(item.clothing_category) === filter_category,
    );

    return this.recommendationsAndItems(filtered);
  }

  //gets recommended and all other wishlist items for outfit-builder page
  async getWishlistForBuilder(
    filter_category: FilterCategory = 'tops',
    auth_id: string,
  ): Promise<OutfitBuilderTab> {
    const supabase = this.supabaseService.client;

    const profile_id = await this.get_profile_id(auth_id);

    const { data, error } = await supabase
      .from('wishlist')
      .select('id, catalogue_items!inner(*)')
      .eq('user_id', profile_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const wishlistItems = (data ?? []).map((row: any) => ({
      wishlist_id: row.id,
      ...row.catalogue_items,
    }));

    const filtered = wishlistItems.filter(
      (item) => resolveFilterGroup(item.category) === filter_category,
    );

    return this.recommendationsAndItems(filtered);
  }

  async createOutfit(
    createOutfitDto: CreateOutfitDto,
    auth_id: string,
  ): Promise<OutfitWithItems> {
    const supabase = this.supabaseService.client;

    const { name, occasion, style, season, items } = createOutfitDto;

    //verify any wardrobe items belong to user and catalogue items exist
    await this.verify_items(auth_id, items);

    //check each item is either a wardrobe or catalogue item
    await this.validateItemSource(items);

    const outfitName = name?.trim() || 'My Outfit';

    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .insert({ user_id: auth_id, name: outfitName, occasion, style, season })
      .select()
      .single();

    if (outfitError) {
      throw new HttpException(
        outfitError.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    //add the outfit items to outfit_items
    const outfitItemsData = items.map((item) => ({
      outfit_id: outfit.id,
      wardrobe_items_id: item.wardrobe_items_id ?? null,
      catalogue_items_id: item.catalogue_items_id ?? null,
    }));

    const { data: outfitItems, error: itemsError } = await supabase
      .from('outfit_items')
      .insert(outfitItemsData)
      .select();

    if (itemsError) {
      //delete the outfit if its items failed to save
      await supabase.from('outfits').delete().eq('id', outfit.id);
      throw new HttpException(
        itemsError.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { ...outfit, outfit_items: outfitItems };
  }

  async updateOutfit(
    id: string,
    updateOutfitDto: UpdateOutfitDto,
    auth_id: string,
  ): Promise<OutfitWithItems> {
    const supabase = this.supabaseService.client;

    //verify outfit exists and belongs to user
    await this.check_outfit_belongs_to_user(auth_id, id);

    const { name, occasion, style, season, items } = updateOutfitDto;

    const updateFields: OutfitUpdateFields = {};
    if (name !== undefined) {
      updateFields.name = name;
    }
    if (occasion !== undefined) {
      updateFields.occasion = occasion;
    }
    if (style !== undefined) {
      updateFields.style = style;
    }
    if (season !== undefined) {
      updateFields.season = season;
    }

    if (Object.keys(updateFields).length > 0) {
      const { error: updateError } = await supabase
        .from('outfits')
        .update(updateFields)
        .eq('id', id);

      if (updateError) {
        throw new HttpException(
          updateError.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    if (items !== undefined) {
      await this.verify_items(auth_id, items);

      await this.validateItemSource(items);

      //replace entire outfit items list if items are updated
      const { error: deleteError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', id);

      if (deleteError) {
        throw new HttpException(
          deleteError.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const updateOutfitItems = items.map((item) => ({
        outfit_id: id,
        wardrobe_items_id: item.wardrobe_items_id ?? null,
        catalogue_items_id: item.catalogue_items_id ?? null,
      }));

      const { error: insertError } = await supabase
        .from('outfit_items')
        .insert(updateOutfitItems);

      if (insertError) {
        throw new HttpException(
          insertError.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return this.getOutfit(id, auth_id);
  }

  async deleteOutfit(id: string, auth_id: string): Promise<void> {
    const supabase = this.supabaseService.client;

    await this.check_outfit_belongs_to_user(auth_id, id);

    const { error } = await supabase.from('outfits').delete().eq('id', id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //TO-DO: implement with ML logic once integrated. Currently, this just returns ten items as placeholder "recommendations"
  //and then also returns the remaining items
  private async recommendationsAndItems<T extends { id: string }>(
    items: T[],
  ): Promise<OutfitBuilderTab<T>> {
    const recommendations = items.slice(0, 10);
    const recommendedIds = new Set(recommendations.map((item) => item.id));
    const remaining = items.filter((item) => !recommendedIds.has(item.id));

    return { recommendations, items: remaining };
  }

  private async check_outfit_belongs_to_user(
    auth_id: string,
    outfit_id: string,
  ) {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('outfits')
      .select('id')
      .eq('id', outfit_id)
      .eq('user_id', auth_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (data.length === 0) {
      throw new NotFoundException(
        'No outfit with specified id found for this user',
      );
    }
  }

  private async verify_items(auth_id: string, items: CreateOutfitItemDto[]) {
    const supabase = this.supabaseService.client;

    const wardrobeIds = items
      .map((item) => item.wardrobe_items_id)
      .filter((id): id is string => id !== null && id !== undefined);

    const catalogueIds = items
      .map((item) => item.catalogue_items_id)
      .filter((id): id is string => id !== null && id !== undefined);

    if (wardrobeIds.length > 0) {
      const profile_id = await this.get_profile_id(auth_id);

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('id')
        .eq('user_id', profile_id)
        .in('id', wardrobeIds);

      if (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (data.length !== wardrobeIds.length) {
        throw new NotFoundException(
          'One or more wardrobe items not found, or do not belong to this user',
        );
      }
    }

    if (catalogueIds.length > 0) {
      const { data, error } = await supabase
        .from('catalogue_items')
        .select('id')
        .in('id', catalogueIds);

      if (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (data.length !== catalogueIds.length) {
        throw new NotFoundException(
          'One or more catalogue items were not found',
        );
      }
    }
  }

  //check to ensure each outfit item is either wardrobe or catalogue item, not both and not neither
  private async validateItemSource(items: CreateOutfitItemDto[]) {
    for (const item of items) {
      const hasWardrobeItem = !!item.wardrobe_items_id;
      const hasCatalogueItem = !!item.catalogue_items_id;

      if (hasWardrobeItem === hasCatalogueItem) {
        throw new BadRequestException(
          'Exactly one of wardrobe_items_id or catalogue_items_id must be provided',
        );
      }
    }
  }

  private async get_profile_id(auth_id: string) {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', auth_id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // if no user throw not found exception
    if (data.length === 0) {
      throw new NotFoundException('No user found');
    }

    return data[0].id;
  }
}
