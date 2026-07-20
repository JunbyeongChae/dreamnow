import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";

import { getNotices, getNotice, deleteNotice } from "../api/notices";
import { getInquiries, createInquiry } from "../api/inquiries";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useAuthStore } from "../store/authStore";
import NoticeList from "../components/support/NoticeList";
import InquiryList from "../components/support/InquiryList";
import InquiryDetail from "../components/support/InquiryDetail";
import NoticeForm from "../components/admin/NoticeForm";
import Button from "../components/common/Button";
import FormInput from "../components/common/FormInput";

const MAX_WIDTH_CLASS = "mx-auto w-full md:max-w-[560px] lg:max-w-[900px]";

type Tab = "notice" | "inquiry";

function SupportPage() {
  const breakpoint = useBreakpoint();
  const requireAuth = useRequireAuth();
  const { user, isAdminMode } = useAuthStore();
  const isAdmin = user?.role === "admin" && isAdminMode;
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("notice");
  const [noticeId, setNoticeId] = useState<number | null>(null);
  const [editingNotice, setEditingNotice] = useState(false);
  const [inquiryId, setInquiryId] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const { data: notices } = useQuery({
    queryKey: ["notices"],
    queryFn: () => getNotices(1, 20),
  });
  const { data: notice } = useQuery({
    queryKey: ["notice", noticeId],
    queryFn: () => getNotice(noticeId!),
    enabled: noticeId !== null,
  });

  const { data: inquiries } = useQuery({
    queryKey: ["inquiries"],
    queryFn: getInquiries,
    enabled: tab === "inquiry" && !!user,
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setNoticeId(null);
    },
  });

  const handleDeleteNotice = () => {
    if (noticeId !== null && window.confirm("이 공지사항을 삭제할까요?")) deleteNoticeMutation.mutate(noticeId);
  };

  const createMutation = useMutation({
    mutationFn: () => createInquiry(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      setForm({ title: "", content: "" });
      setWriting(false);
    },
  });

  const handleSelectTab = (next: Tab) => {
    if (next === "inquiry" && !requireAuth()) return;
    setTab(next);
    setNoticeId(null);
    setEditingNotice(false);
    setInquiryId(null);
    setWriting(false);
  };

  const handleWriteClick = () => {
    if (!requireAuth()) return;
    setWriting(true);
  };

  const handleSubmitInquiry = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <div className={MAX_WIDTH_CLASS}>
        <div className="mb-6 flex gap-6 border-b border-border-neutral">
          <button
            onClick={() => handleSelectTab("notice")}
            className={`pb-3 text-sm font-bold ${tab === "notice" ? "text-accent" : "text-text-muted"}`}
          >
            공지사항
          </button>
          <button
            onClick={() => handleSelectTab("inquiry")}
            className={`pb-3 text-sm font-bold ${tab === "inquiry" ? "text-accent" : "text-text-muted"}`}
          >
            1:1 문의
          </button>
        </div>

        {tab === "notice" &&
          (noticeId === null ? (
            <>
              {isAdmin && (
                <div className="mb-6">
                  <NoticeForm />
                </div>
              )}
              <NoticeList notices={notices?.items ?? []} breakpoint={breakpoint} onSelect={setNoticeId} />
            </>
          ) : (
            notice &&
            (editingNotice ? (
              <NoticeForm notice={notice} onDone={() => setEditingNotice(false)} />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => setNoticeId(null)} className="text-sm text-accent">
                    ← 목록으로
                  </button>
                  {isAdmin && (
                    <div className="flex gap-3">
                      <button onClick={() => setEditingNotice(true)} className="text-sm font-bold text-accent">
                        수정
                      </button>
                      <button onClick={handleDeleteNotice} className="text-sm font-bold text-red-500">
                        삭제
                      </button>
                    </div>
                  )}
                </div>
                <h1 className="font-display text-xl text-primary">{notice.title}</h1>
                <div
                  className="text-sm text-primary"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.content) }}
                />
              </div>
            ))
          ))}

        {tab === "inquiry" &&
          (writing ? (
            <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-3">
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
                <Button type="submit" variant="primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "등록 중..." : "등록"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setWriting(false)}>
                  취소
                </Button>
              </div>
            </form>
          ) : inquiryId === null ? (
            <>
              <div className="mb-4 flex justify-end">
                <Button variant="primary" onClick={handleWriteClick}>
                  {breakpoint === "mobile" ? "작성" : "문의 작성"}
                </Button>
              </div>
              <InquiryList inquiries={inquiries ?? []} breakpoint={breakpoint} onSelect={setInquiryId} />
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <button onClick={() => setInquiryId(null)} className="self-start text-sm text-accent">
                ← 목록으로
              </button>
              <InquiryDetail id={inquiryId} onDeleted={() => setInquiryId(null)} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default SupportPage;
