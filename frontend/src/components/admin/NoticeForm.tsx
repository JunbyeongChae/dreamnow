import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { createNotice, updateNotice } from "../../api/notices";
import type { NoticeDetail } from "../../types/notice";
import Button from "../common/Button";
import FormInput from "../common/FormInput";

interface NoticeFormProps {
  notice?: NoticeDetail;
  onDone?: () => void;
}

function NoticeForm({ notice, onDone }: NoticeFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(notice?.title ?? "");
  const editor = useEditor({
    extensions: [StarterKit],
    content: notice?.content ?? "",
    editorProps: {
      attributes: { class: "min-h-[150px] rounded border border-input-border px-[14px] py-[13px] text-sm" },
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notices"] });

  const createMutation = useMutation({
    mutationFn: () => createNotice({ title, content: editor?.getHTML() ?? "" }),
    onSuccess: () => {
      invalidate();
      setTitle("");
      editor?.commands.clearContent();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateNotice(notice!.id, { title, content: editor?.getHTML() ?? "" }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["notice", notice!.id] });
      onDone?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (notice) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isEmpty = useEditorState({
    editor,
    selector: ({ editor }) => editor?.isEmpty ?? true,
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-border-warm bg-white p-4">
      <h3 className="font-display text-lg text-primary">{notice ? "공지사항 수정" : "공지사항 등록"}</h3>
      <FormInput label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-primary">내용</label>
        <EditorContent editor={editor} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="accent" disabled={!title || isEmpty || isPending}>
          {isPending ? "저장 중..." : notice ? "수정 저장" : "공지 등록"}
        </Button>
        {notice && (
          <Button type="button" variant="outline" onClick={onDone}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}

export default NoticeForm;
