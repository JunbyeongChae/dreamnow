export interface Comment {
  id: number;
  noticeId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentCreateRequest {
  content: string;
}

export interface CommentUpdateRequest {
  content: string;
}
