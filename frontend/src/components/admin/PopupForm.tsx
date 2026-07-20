import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createPopup, deletePopup, getPopups, updatePopup } from "../../api/popups";
import type { Popup } from "../../types/popup";
import Button from "../common/Button";
import FormInput from "../common/FormInput";

const EMPTY_FORM = { title: "", content: "", startAt: "", endAt: "" };

function PopupForm() {
  const queryClient = useQueryClient();
  const { data: popups } = useQuery({ queryKey: ["popups"], queryFn: getPopups });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["popups"] });

  const createMutation = useMutation({
    mutationFn: createPopup,
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updatePopup>[1] }) => updatePopup(id, body),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePopup,
    onSuccess: invalidate,
  });

  const startEdit = (popup: Popup) => {
    setEditingId(popup.id);
    setForm({ title: popup.title, content: popup.content, startAt: "", endAt: "" });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      title: form.title,
      content: form.content,
      startAt: form.startAt || undefined,
      endAt: form.endAt || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="border border-border-warm bg-white p-4">
      <h3 className="mb-3 font-display text-lg text-primary">팝업 관리</h3>

      <ul className="mb-4 flex flex-col gap-2">
        {popups?.map((popup) => (
          <li key={popup.id} className="flex items-center gap-3 border-b border-border-neutral pb-2">
            <span className="flex-1 truncate text-sm text-primary">{popup.title}</span>
            <button type="button" className="text-xs font-bold text-accent" onClick={() => startEdit(popup)}>
              수정
            </button>
            <button
              type="button"
              className="text-xs font-bold text-red-500"
              onClick={() => {
                if (window.confirm("이 팝업을 삭제할까요?")) deleteMutation.mutate(popup.id);
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

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
            rows={3}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            required
          />
        </div>
        <div className="flex gap-3">
          <FormInput
            label="노출 시작(선택)"
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
          />
          <FormInput
            label="노출 종료(선택)"
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="accent" disabled={isPending}>
            {editingId ? "수정 저장" : "팝업 등록"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
            >
              취소
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default PopupForm;
