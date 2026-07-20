import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createBanner, deleteBanner, getBanners, updateBanner } from "../../api/banners";
import type { Banner } from "../../types/banner";
import Button from "../common/Button";
import FormInput from "../common/FormInput";
import ImageSlot from "../common/ImageSlot";
import ImageUploader from "../common/ImageUploader";

const EMPTY_FORM = { imageUrl: "", linkUrl: "", sortOrder: "0", startAt: "", endAt: "" };

function BannerForm() {
  const queryClient = useQueryClient();
  const { data: banners } = useQuery({ queryKey: ["banners"], queryFn: getBanners });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["banners"] });

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateBanner>[1] }) => updateBanner(id, body),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: invalidate,
  });

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? "",
      sortOrder: String(banner.sortOrder),
      startAt: "",
      endAt: "",
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl || undefined,
      sortOrder: Number(form.sortOrder),
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
      <h3 className="mb-3 font-display text-lg text-primary">배너 관리</h3>

      <ul className="mb-4 flex flex-col gap-2">
        {banners?.map((banner) => (
          <li key={banner.id} className="flex items-center gap-3 border-b border-border-neutral pb-2">
            <ImageSlot src={banner.imageUrl} alt="배너" className="h-12 w-20" />
            <span className="flex-1 truncate text-xs text-text-muted">{banner.linkUrl || "링크 없음"}</span>
            <span className="text-xs text-caption">순서 {banner.sortOrder}</span>
            <button type="button" className="text-xs font-bold text-accent" onClick={() => startEdit(banner)}>
              수정
            </button>
            <button
              type="button"
              className="text-xs font-bold text-red-500"
              onClick={() => deleteMutation.mutate(banner.id)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <ImageUploader
          label="배너 이미지"
          value={form.imageUrl || null}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
        />
        <FormInput
          label="링크 URL(선택)"
          value={form.linkUrl}
          onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
        />
        <FormInput
          label="노출 순서"
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
        />
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
          <Button type="submit" variant="accent" disabled={!form.imageUrl || isPending}>
            {editingId ? "수정 저장" : "배너 등록"}
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

export default BannerForm;
