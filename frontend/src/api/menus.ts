import type {
  MenuCategory,
  MenuCreateRequest,
  MenuDetail,
  MenuListItem,
  MenuSubCategory,
  MenuUpdateRequest,
} from "../types/menu";
import { apiRequest } from "./client";

export function getMenus(category: MenuCategory, subCategory?: MenuSubCategory) {
  const params = new URLSearchParams({ category });
  if (subCategory) {
    params.set("subCategory", subCategory);
  }
  return apiRequest<MenuListItem[]>(`/api/menus?${params.toString()}`);
}

export function getMenu(id: number) {
  return apiRequest<MenuDetail>(`/api/menus/${id}`);
}

export function createMenu(body: MenuCreateRequest) {
  return apiRequest<{ id: number }>("/api/menus", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateMenu(id: number, body: MenuUpdateRequest) {
  return apiRequest<{ id: number }>(`/api/menus/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMenu(id: number) {
  return apiRequest<null>(`/api/menus/${id}`, { method: "DELETE" });
}
