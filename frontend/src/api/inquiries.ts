import type { InquiryAnswerRequest, InquiryCreateRequest, InquiryDetail, InquiryListItem } from "../types/inquiry";
import { apiRequest } from "./client";

export function createInquiry(body: InquiryCreateRequest) {
  return apiRequest<{ id: number }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getInquiries() {
  return apiRequest<InquiryListItem[]>("/api/inquiries");
}

export function getInquiry(id: number) {
  return apiRequest<InquiryDetail>(`/api/inquiries/${id}`);
}

export function answerInquiry(id: number, body: InquiryAnswerRequest) {
  return apiRequest<{ id: number; answeredAt: string }>(`/api/inquiries/${id}/answer`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
