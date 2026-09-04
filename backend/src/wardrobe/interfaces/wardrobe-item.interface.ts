export interface WardrobeItem {
    id: string;
    userID: string;
    imageURL: string;
    clothingCategory: string;
    style: string;
    colour: string[];
    created: Date;
    modified: Date;
    brand: string;
    size: string;
    material: string[];
    // TODO - check with group (could add season, occasion, wear count, cost etc.)
}