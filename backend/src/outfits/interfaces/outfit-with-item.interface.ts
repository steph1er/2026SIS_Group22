import { Outfit } from './outfit.interface';
import { OutfitItem } from './outfit-item.interface';

export interface OutfitWithItems extends Outfit {
  outfit_items: OutfitItem[];
}
