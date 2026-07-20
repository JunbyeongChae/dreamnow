export interface InquiryListItem {
  id: number;
  title: string;
  answeredAt: string | null;
  createdAt: string;
}

export interface InquiryDetail {
  id: number;
  userId: number;
  title: string;
  content: string;
  answerContent: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface InquiryCreateRequest {
  title: string;
  content: string;
}

export interface InquiryUpdateRequest {
  title: string;
  content: string;
}

export interface InquiryAnswerRequest {
  answerContent: string;
}
