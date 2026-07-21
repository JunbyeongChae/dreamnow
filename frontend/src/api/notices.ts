import type { NoticeCreateRequest, NoticeDetail, NoticeListResponse, NoticeUpdateRequest } from "../types/notice";
import { apiRequest } from "./client";

export function getNotices(page = 1, size = 10) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return apiRequest<NoticeListResponse>(`/api/notices?${params.toString()}`);
}

export function getNotice(id: number) {
  return apiRequest<NoticeDetail>(`/api/notices/${id}`);
}

export function createNotice(body: NoticeCreateRequest) {
  return apiRequest<{ id: number }>("/api/notices", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateNotice(id: number, body: NoticeUpdateRequest) {
  return apiRequest<{ id: number }>(`/api/notices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteNotice(id: number) {
  return apiRequest<null>(`/api/notices/${id}`, { method: "DELETE" });
}

export function generateAiDraft(title: string) {
  return apiRequest<{ content: string }>("/api/notices/ai-draft", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
