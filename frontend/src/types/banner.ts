export interface Banner {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
}

export interface BannerCreateRequest {
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  startAt?: string;
  endAt?: string;
}

export interface BannerUpdateRequest {
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
  startAt?: string;
  endAt?: string;
  isActive?: boolean;
}
