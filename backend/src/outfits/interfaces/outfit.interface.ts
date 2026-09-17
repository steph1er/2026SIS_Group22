export interface Outfit {
  id: string;
  userID: string;
  name: string | null;
  occasion: string | null;
  style: string | null;
  season: string | null;
  createdAt: Date;
  modifiedAt: Date;
}
