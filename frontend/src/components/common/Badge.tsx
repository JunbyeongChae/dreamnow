import type { ReactNode } from "react";

type BadgeVariant = "outline-accent" | "status-success" | "status-pending";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  "outline-accent": "border border-accent text-accent bg-white",
  "status-success": "bg-status-success text-white",
  "status-pending": "bg-status-pending-bg text-status-pending-text",
};

function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
