import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickLinkCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  variant?: "full" | "compact";
  className?: string;
}

function QuickLinkCard({ icon: Icon, title, description, to, variant = "full", className = "" }: QuickLinkCardProps) {
  return (
    <div className={`flex flex-col items-center gap-2 bg-white p-6 text-center ${className}`}>
      <Icon size={28} className="text-accent" />
      <h3 className="font-display text-base text-primary">{title}</h3>

      {variant === "full" && (
        <>
          <p className="text-sm text-text-muted">{description}</p>
          <Link to={to} className="text-sm font-bold text-accent">
            자세히 보기 →
          </Link>
        </>
      )}
    </div>
  );
}

export default QuickLinkCard;
