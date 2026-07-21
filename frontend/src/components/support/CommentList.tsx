import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createComment, deleteComment, getComments, updateComment } from "../../api/comments";
import { useAuthStore } from "../../store/authStore";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import Button from "../common/Button";

interface CommentListProps {
  noticeId: number;
}

function CommentList({ noticeId }: CommentListProps) {
  const { user, isAdminMode } = useAuthStore();
  const isAdmin = user?.role === "admin" && isAdminMode;
  const requireAuth = useRequireAuth();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["comments", noticeId],
    queryFn: () => getComments(noticeId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["comments", noticeId] });

  const createMutation = useMutation({
    mutationFn: () => createComment(noticeId, { content }),
    onSuccess: () => {
      setContent("");
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (commentId: number) => updateComment(commentId, { content: editingContent }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: invalidate,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!content.trim()) return;
    createMutation.mutate();
  };

  const startEdit = (commentId: number, currentContent: string) => {
    setEditingId(commentId);
    setEditingContent(currentContent);
  };

  const handleUpdate = (e: FormEvent, commentId: number) => {
    e.preventDefault();
    if (!editingContent.trim()) return;
    updateMutation.mutate(commentId);
  };

  const handleDelete = (commentId: number) => {
    if (window.confirm("이 댓글을 삭제할까요?")) deleteMutation.mutate(commentId);
  };

  return (
    <div className="flex flex-col gap-4 border-t border-border-neutral pt-4">
      <h2 className="text-sm font-bold text-primary">댓글 {comments?.length ?? 0}</h2>

      <ul className="flex flex-col gap-3">
        {comments?.map((comment) => {
          const canManage = isAdmin || comment.userId === user?.id;
          return (
            <li key={comment.id} className="rounded border border-border-neutral p-3">
              {editingId === comment.id ? (
                <form onSubmit={(e) => handleUpdate(e, comment.id)} className="flex flex-col gap-2">
                  <textarea
                    className="rounded border border-input-border px-[14px] py-[13px] text-sm text-primary"
                    rows={3}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
                      저장
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                      취소
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{comment.username}</span>
                    {canManage && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(comment.id, comment.content)}
                          className="text-xs font-bold text-accent"
                        >
                          수정
                        </button>
                        <button onClick={() => handleDelete(comment.id)} className="text-xs font-bold text-red-500">
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-primary">{comment.content}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="rounded border border-input-border px-[14px] py-[13px] text-sm text-primary"
          rows={2}
          placeholder={user ? "댓글을 입력하세요" : "로그인 후 댓글을 작성할 수 있습니다"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={createMutation.isPending} className="self-end">
          등록
        </Button>
      </form>
    </div>
  );
}

export default CommentList;
