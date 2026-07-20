import { useQuery } from "@tanstack/react-query";

import { getInquiry } from "../../api/inquiries";
import { ApiError } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import Badge from "../common/Badge";
import InquiryAnswerForm from "../admin/InquiryAnswerForm";

interface InquiryDetailProps {
  id: number;
}

function InquiryDetail({ id }: InquiryDetailProps) {
  const { user, isAdminMode } = useAuthStore();
  const showAnswerForm = user?.role === "admin" && isAdminMode;

  const { data: inquiry, error } = useQuery({
    queryKey: ["inquiry", id],
    queryFn: () => getInquiry(id),
  });

  if (error) {
    return (
      <p className="text-sm text-text-muted">
        {error instanceof ApiError && error.code === "FORBIDDEN" ? error.message : "문의를 불러올 수 없습니다"}
      </p>
    );
  }

  if (!inquiry) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge variant={inquiry.answeredAt ? "status-success" : "status-pending"}>
          {inquiry.answeredAt ? "답변완료" : "답변대기"}
        </Badge>
        <h1 className="font-display text-xl text-primary">{inquiry.title}</h1>
      </div>
      <p className="whitespace-pre-wrap text-sm text-primary">{inquiry.content}</p>

      {inquiry.answerContent && (
        <div className="border-t border-border-neutral pt-4">
          <span className="text-sm font-bold text-accent">답변</span>
          <p className="mt-2 whitespace-pre-wrap text-sm text-primary">{inquiry.answerContent}</p>
        </div>
      )}

      {showAnswerForm && !inquiry.answerContent && <InquiryAnswerForm inquiryId={id} />}
    </div>
  );
}

export default InquiryDetail;
