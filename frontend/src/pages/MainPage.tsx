import { Building2, Coffee, MessageCircleQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getNotices } from "../api/notices";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useAuthStore } from "../store/authStore";
import BannerSlider from "../components/banner/BannerSlider";
import PopupModal from "../components/popup/PopupModal";
import QuickLinkCard from "../components/common/QuickLinkCard";
import SectionHeader from "../components/common/SectionHeader";
import BannerForm from "../components/admin/BannerForm";
import PopupForm from "../components/admin/PopupForm";

const QUICK_LINKS = [
  { icon: Building2, title: "기업소개", description: "배익거리의 브랜드 스토리를 만나보세요", to: "/about" },
  { icon: Coffee, title: "메뉴소개", description: "정성으로 만든 빵과 커피를 확인해보세요", to: "/menu" },
  { icon: MessageCircleQuestion, title: "고객센터", description: "공지사항과 1:1 문의를 확인해보세요", to: "/support" },
];

function MainPage() {
  const breakpoint = useBreakpoint();
  const variant = breakpoint === "desktop" ? "full" : "compact";
  const { user, isAdminMode } = useAuthStore();
  const showAdminForms = user?.role === "admin" && isAdminMode;

  const { data: notices } = useQuery({
    queryKey: ["notices", "preview"],
    queryFn: () => getNotices(1, 3),
  });

  return (
    <div>
      <PopupModal />
      <BannerSlider />

      {showAdminForms && (
        <section className="flex flex-col gap-4 px-4 py-6 md:px-8">
          <BannerForm />
          <PopupForm />
        </section>
      )}

      <section className="bg-bg-warm px-4 py-10 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {QUICK_LINKS.map((link, index) => (
            <QuickLinkCard
              key={link.to}
              {...link}
              variant={variant}
              className={index === 2 ? "col-span-2 md:col-span-1" : ""}
            />
          ))}
        </div>
      </section>

      <section className="px-4 py-10 md:px-8">
        <SectionHeader title="공지사항" />

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {notices?.items.map((notice) => (
            <Link
              key={notice.id}
              to="/support"
              className="flex flex-col gap-1 border-b border-border-neutral py-3 md:border md:border-border-neutral md:p-4"
            >
              <span className="text-sm font-bold text-primary">{notice.title}</span>
              {breakpoint === "desktop" && (
                <span className="text-xs text-caption">{notice.createdAt.slice(0, 10).replace(/-/g, ".")}</span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MainPage;
