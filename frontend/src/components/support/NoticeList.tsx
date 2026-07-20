import type { Breakpoint } from "../../hooks/useBreakpoint";
import type { NoticeListItem } from "../../types/notice";
import ListRow from "../common/ListRow";

function formatDate(createdAt: string, breakpoint: Breakpoint): string | undefined {
  if (breakpoint === "mobile") return undefined;
  const date = createdAt.slice(0, 10);
  return breakpoint === "tablet" ? date.slice(5).replace("-", ".") : date.replace(/-/g, ".");
}

interface NoticeListProps {
  notices: NoticeListItem[];
  breakpoint: Breakpoint;
  onSelect: (id: number) => void;
}

function NoticeList({ notices, breakpoint, onSelect }: NoticeListProps) {
  if (notices.length === 0) {
    return <p className="text-sm text-text-muted">등록된 공지사항이 없습니다</p>;
  }

  return (
    <div>
      {notices.map((notice) => (
        <ListRow
          key={notice.id}
          title={notice.title}
          date={formatDate(notice.createdAt, breakpoint)}
          onClick={() => onSelect(notice.id)}
        />
      ))}
    </div>
  );
}

export default NoticeList;
