export interface NoticeListItem {
  id: number;
  title: string;
  createdAt: string;
}

export interface NoticeListResponse {
  items: NoticeListItem[];
  total: number;
  page: number;
}

export interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeCreateRequest {
  title: string;
  content: string;
}
