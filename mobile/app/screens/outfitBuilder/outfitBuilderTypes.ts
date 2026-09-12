export type OutfitCategory = 'tops' | 'bottoms' | 'shoes' | 'jewelry';

export type WardrobeItem = {
  id: string;
  image_url: string;
  clothing_category: string;
  style?: string[];
  colour?: string[];
  brand?: string;
  size?: string;
  material?: string[];
  tags?: string[];
  price?: number;
};

export type RecommendedItem = {
  id: string;
  name: string;
  brand: string;
  price: string;
  image_url: string;
  description?: string;
  tags?: string[];
  materials?: string;
};