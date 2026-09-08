export interface WardrobeItem {
    id: string;
    userID: string;
    imageURL: string;
    clothingCategory: string;
    style: string;
    colour: string[];
    createdAt: Date;
    modifiedAt: Date;
    brand: string;
    size: string;
    material: string[];
    tags: string[];
    // TODO - check with group (could add season, occasion, wear count, cost etc.)
}