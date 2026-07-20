import type { MenuCategory, MenuSubCategory } from "../../types/menu";

export const CATEGORIES: { value: MenuCategory; label: string }[] = [
  { value: "season", label: "시즌메뉴" },
  { value: "beverage", label: "음료" },
  { value: "dessert", label: "디저트" },
];

export const SUB_CATEGORIES: { value: MenuSubCategory; label: string }[] = [
  { value: "coffee", label: "coffee" },
  { value: "non_coffee", label: "non-coffee" },
  { value: "tea", label: "tea" },
  { value: "ade_juice", label: "ade·juice" },
];

export interface CategorySelection {
  category: MenuCategory;
  subCategory: MenuSubCategory | null;
}

export interface CategoryNavProps {
  selection: CategorySelection;
  onSelectCategory: (category: MenuCategory) => void;
  onSelectSubCategory: (subCategory: MenuSubCategory) => void;
}
