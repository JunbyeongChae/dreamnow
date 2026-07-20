import type { ReactNode } from "react";

import { useBreakpoint } from "../../hooks/useBreakpoint";

interface ListRowProps {
  leading?: ReactNode;
  title: string;
  date?: string | null;
  status?: ReactNode;
  onClick?: () => void;
}

function ListRow({ leading, title, date, status, onClick }: ListRowProps) {
  const breakpoint = useBreakpoint();
  const showDate = date && breakpoint !== "mobile";

  return (
    <div
      className="flex items-center gap-3 border-b border-border-neutral py-3"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {leading}
      <span className="flex-1 truncate text-sm text-primary">{title}</span>
      {status}
      {showDate && <span className="text-xs text-caption">{date}</span>}
    </div>
  );
}

export default ListRow;
