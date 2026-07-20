import type { Breakpoint } from "../../hooks/useBreakpoint";
import type { InquiryListItem } from "../../types/inquiry";
import Badge from "../common/Badge";
import ListRow from "../common/ListRow";

function formatDate(createdAt: string, breakpoint: Breakpoint): string | undefined {
  if (breakpoint === "mobile") return undefined;
  const date = createdAt.slice(0, 10);
  return breakpoint === "tablet" ? date.slice(5).replace("-", ".") : date.replace(/-/g, ".");
}

interface InquiryListProps {
  inquiries: InquiryListItem[];
  breakpoint: Breakpoint;
  onSelect: (id: number) => void;
}

function InquiryList({ inquiries, breakpoint, onSelect }: InquiryListProps) {
  if (inquiries.length === 0) {
    return <p className="text-sm text-text-muted">등록된 문의가 없습니다</p>;
  }

  return (
    <div>
      {inquiries.map((inquiry) => (
        <ListRow
          key={inquiry.id}
          title={inquiry.title}
          date={formatDate(inquiry.createdAt, breakpoint)}
          status={
            <Badge variant={inquiry.answeredAt ? "status-success" : "status-pending"}>
              {inquiry.answeredAt ? "답변완료" : "답변대기"}
            </Badge>
          }
          onClick={() => onSelect(inquiry.id)}
        />
      ))}
    </div>
  );
}

export default InquiryList;
