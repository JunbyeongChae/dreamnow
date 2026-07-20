import type { NoticeCreateRequest, NoticeDetail, NoticeListResponse } from "../types/notice";
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
