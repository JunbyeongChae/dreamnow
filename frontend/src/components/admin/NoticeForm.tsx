import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { createNotice } from "../../api/notices";
import Button from "../common/Button";
import FormInput from "../common/FormInput";

function NoticeForm() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: { class: "min-h-[150px] rounded border border-input-border px-[14px] py-[13px] text-sm" },
    },
  });

  const mutation = useMutation({
    mutationFn: () => createNotice({ title, content: editor?.getHTML() ?? "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setTitle("");
      editor?.commands.clearContent();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const isEmpty = useEditorState({
    editor,
    selector: ({ editor }) => editor?.isEmpty ?? true,
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-border-warm bg-white p-4">
      <h3 className="font-display text-lg text-primary">공지사항 등록</h3>
      <FormInput label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-primary">내용</label>
        <EditorContent editor={editor} />
      </div>
      <Button type="submit" variant="accent" disabled={!title || isEmpty || mutation.isPending} className="self-start">
        {mutation.isPending ? "등록 중..." : "공지 등록"}
      </Button>
    </form>
  );
}

export default NoticeForm;
