import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { answerInquiry, updateInquiryAnswer } from "../../api/inquiries";
import Button from "../common/Button";

interface InquiryAnswerFormProps {
  inquiryId: number;
  existingAnswer?: string | null;
}

function InquiryAnswerForm({ inquiryId, existingAnswer }: InquiryAnswerFormProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(existingAnswer ?? "");
  const isEdit = !!existingAnswer;

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateInquiryAnswer(inquiryId, { answerContent: content })
        : answerInquiry(inquiryId, { answerContent: content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-border-neutral pt-4">
      <label className="text-sm font-bold text-primary">{isEdit ? "답변 수정" : "답변 작성"}</label>
      <textarea
        className="rounded border border-input-border px-[14px] py-[13px] text-sm text-primary"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <Button type="submit" variant="accent" disabled={!content || mutation.isPending} className="self-start">
        {mutation.isPending ? "저장 중..." : isEdit ? "답변 수정" : "답변 등록"}
      </Button>
    </form>
  );
}

export default InquiryAnswerForm;
