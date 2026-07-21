import type { Comment, CommentCreateRequest, CommentUpdateRequest } from "../types/comment";
import { apiRequest } from "./client";

export function getComments(noticeId: number) {
  return apiRequest<Comment[]>(`/api/notices/${noticeId}/comments`);
}

export function createComment(noticeId: number, body: CommentCreateRequest) {
  return apiRequest<Comment>(`/api/notices/${noticeId}/comments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateComment(commentId: number, body: CommentUpdateRequest) {
  return apiRequest<Comment>(`/api/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteComment(commentId: number) {
  return apiRequest<null>(`/api/comments/${commentId}`, { method: "DELETE" });
}
