export interface WardrobeItem {
    id: string;
    userID: string;
    imageURL: string;
    clothingCategory: string;
    style: string[];
    colour: string[];
    createdAt: Date;
    modifiedAt: Date;
    brand: string;
    size: string;
    material: string[];
    tags: string[];
    price: number;
}