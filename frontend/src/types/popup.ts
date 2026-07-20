export interface Popup {
  id: number;
  title: string;
  content: string;
}

export interface PopupCreateRequest {
  title: string;
  content: string;
  startAt?: string;
  endAt?: string;
}

export interface PopupUpdateRequest {
  title?: string;
  content?: string;
  startAt?: string;
  endAt?: string;
  isActive?: boolean;
}
