import type { Popup, PopupCreateRequest, PopupUpdateRequest } from "../types/popup";
import { apiRequest } from "./client";

export function getPopups() {
  return apiRequest<Popup[]>("/api/popups");
}

export function createPopup(body: PopupCreateRequest) {
  return apiRequest<{ id: number }>("/api/popups", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePopup(id: number, body: PopupUpdateRequest) {
  return apiRequest<{ id: number }>(`/api/popups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deletePopup(id: number) {
  return apiRequest<null>(`/api/popups/${id}`, { method: "DELETE" });
}
