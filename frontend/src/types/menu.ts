export type MenuCategory = "season" | "beverage" | "dessert";
export type MenuSubCategory = "coffee" | "non_coffee" | "tea" | "ade_juice";

export interface MenuListItem {
  id: number;
  name: string;
  imageUrl: string;
}

export interface MenuDetail {
  id: number;
  category: MenuCategory;
  subCategory: MenuSubCategory | null;
  name: string;
  imageUrl: string;
  price: number;
  description: string | null;
}

export interface MenuCreateRequest {
  category: MenuCategory;
  subCategory?: MenuSubCategory;
  name: string;
  imageUrl: string;
  price: number;
  description?: string;
}
