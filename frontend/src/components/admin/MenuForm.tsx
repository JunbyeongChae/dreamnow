import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createMenu, updateMenu } from "../../api/menus";
import type { MenuCategory, MenuDetail, MenuSubCategory } from "../../types/menu";
import { CATEGORIES, SUB_CATEGORIES } from "../menu/categoryData";
import Button from "../common/Button";
import FormInput from "../common/FormInput";
import ImageUploader from "../common/ImageUploader";

const EMPTY_FORM = {
  category: "season" as MenuCategory,
  subCategory: "coffee" as MenuSubCategory,
  name: "",
  imageUrl: "",
  price: "",
  description: "",
};

interface MenuFormProps {
  menu?: MenuDetail;
  onDone?: () => void;
}

function MenuForm({ menu, onDone }: MenuFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() =>
    menu
      ? {
          category: menu.category,
          subCategory: menu.subCategory ?? "coffee",
          name: menu.name,
          imageUrl: menu.imageUrl,
          price: String(menu.price),
          description: menu.description ?? "",
        }
      : EMPTY_FORM,
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["menus"] });

  const createMutation = useMutation({
    mutationFn: () =>
      createMenu({
        category: form.category,
        subCategory: form.category === "beverage" ? form.subCategory : undefined,
        name: form.name,
        imageUrl: form.imageUrl,
        price: Number(form.price),
        description: form.description || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateMenu(menu!.id, {
        category: form.category,
        subCategory: form.category === "beverage" ? form.subCategory : null,
        name: form.name,
        imageUrl: form.imageUrl,
        price: Number(form.price),
        description: form.description || undefined,
      }),
    onSuccess: () => {
      invalidate();
      onDone?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (menu) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="border border-border-warm bg-white p-4">
      <h3 className="mb-3 font-display text-lg text-primary">{menu ? "메뉴 수정" : "메뉴 등록"}</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-primary">카테고리</label>
          <select
            className="rounded border border-input-border px-[14px] py-[13px] text-sm text-primary"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MenuCategory }))}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {form.category === "beverage" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-primary">하위 카테고리</label>
            <select
              className="rounded border border-input-border px-[14px] py-[13px] text-sm text-primary"
              value={form.subCategory}
              onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value as MenuSubCategory }))}
            >
              {SUB_CATEGORIES.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <FormInput
          label="이름"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <FormInput
          label="가격"
          type="number"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-primary">설명(선택)</label>
          <textarea
            className="rounded border border-input-border px-[14px] py-[13px] text-sm text-primary"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <ImageUploader
          label="메뉴 이미지"
          value={form.imageUrl || null}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
        />

        <div className="flex gap-2">
          <Button type="submit" variant="accent" disabled={!form.imageUrl || !form.name || !form.price || isPending}>
            {isPending ? "저장 중..." : menu ? "수정 저장" : "메뉴 등록"}
          </Button>
          {menu && (
            <Button type="button" variant="outline" onClick={onDone}>
              취소
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MenuForm;
