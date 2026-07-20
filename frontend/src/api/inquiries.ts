import type {
  InquiryAnswerRequest,
  InquiryCreateRequest,
  InquiryDetail,
  InquiryListItem,
  InquiryUpdateRequest,
} from "../types/inquiry";
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

export function updateInquiryAnswer(id: number, body: InquiryAnswerRequest) {
  return apiRequest<{ id: number; answeredAt: string }>(`/api/inquiries/${id}/answer`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function updateInquiry(id: number, body: InquiryUpdateRequest) {
  return apiRequest<{ id: number }>(`/api/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteInquiry(id: number) {
  return apiRequest<null>(`/api/inquiries/${id}`, { method: "DELETE" });
}
