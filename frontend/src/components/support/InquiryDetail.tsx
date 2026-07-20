import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteInquiry, getInquiry, updateInquiry } from "../../api/inquiries";
import { ApiError } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import Badge from "../common/Badge";
import Button from "../common/Button";
import FormInput from "../common/FormInput";
import InquiryAnswerForm from "../admin/InquiryAnswerForm";

interface InquiryDetailProps {
  id: number;
  onDeleted?: () => void;
}

function InquiryDetail({ id, onDeleted }: InquiryDetailProps) {
  const { user, isAdminMode } = useAuthStore();
  const isAdmin = user?.role === "admin" && isAdminMode;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const { data: inquiry, error } = useQuery({
    queryKey: ["inquiry", id],
    queryFn: () => getInquiry(id),
  });

  const isOwner = !!user && inquiry?.userId === user.id;
  const canEditOrDelete = isOwner && !inquiry?.answeredAt;

  const updateMutation = useMutation({
    mutationFn: () => updateInquiry(id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiry", id] });
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      onDeleted?.();
    },
  });

  const startEdit = () => {
    if (!inquiry) return;
    setForm({ title: inquiry.title, content: inquiry.content });
    setEditing(true);
  };

  const handleDelete = () => {
    if (window.confirm("이 문의글을 삭제할까요?")) deleteMutation.mutate();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (error) {
    return (
      <p className="text-sm text-text-muted">
        {error instanceof ApiError && error.code === "FORBIDDEN" ? error.message : "문의를 불러올 수 없습니다"}
      </p>
    );
  }

  if (!inquiry) return null;

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="제목"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-primary">내용</label>
          <textarea
            className="rounded border border-input-border px-[14px] py-[13px] text-sm text-primary"
            rows={5}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "저장 중..." : "수정 저장"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>
            취소
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={inquiry.answeredAt ? "status-success" : "status-pending"}>
            {inquiry.answeredAt ? "답변완료" : "답변대기"}
          </Badge>
          <h1 className="font-display text-xl text-primary">{inquiry.title}</h1>
        </div>
        {canEditOrDelete && (
          <div className="flex gap-3">
            <button onClick={startEdit} className="text-sm font-bold text-accent">
              수정
            </button>
            <button onClick={handleDelete} className="text-sm font-bold text-red-500">
              삭제
            </button>
          </div>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm text-primary">{inquiry.content}</p>

      {inquiry.answerContent && !isAdmin && (
        <div className="border-t border-border-neutral pt-4">
          <span className="text-sm font-bold text-accent">답변</span>
          <p className="mt-2 whitespace-pre-wrap text-sm text-primary">{inquiry.answerContent}</p>
        </div>
      )}

      {isAdmin && <InquiryAnswerForm inquiryId={id} existingAnswer={inquiry.answerContent} />}
    </div>
  );
}

export default InquiryDetail;
