import type { Banner, BannerCreateRequest, BannerUpdateRequest } from "../types/banner";
import { apiRequest } from "./client";

export function getBanners() {
  return apiRequest<Banner[]>("/api/banners");
}

export function createBanner(body: BannerCreateRequest) {
  return apiRequest<{ id: number }>("/api/banners", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateBanner(id: number, body: BannerUpdateRequest) {
  return apiRequest<{ id: number }>(`/api/banners/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteBanner(id: number) {
  return apiRequest<null>(`/api/banners/${id}`, { method: "DELETE" });
}
