import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { MenuListItem } from "../../types/menu";
import ImageSlot from "../common/ImageSlot";

interface MenuCardProps {
  menu: MenuListItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

function MenuCard({ menu, onEdit, onDelete }: MenuCardProps) {
  const showAdminControls = !!onEdit || !!onDelete;

  return (
    <div className="relative flex flex-col gap-2">
      {showAdminControls && (
        <div className="absolute right-1 top-1 z-10 flex gap-1">
          {onEdit && (
            <button
              type="button"
              aria-label="메뉴 수정"
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
              className="rounded-full bg-white/90 p-1.5 text-primary shadow"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label="메뉴 삭제"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="rounded-full bg-white/90 p-1.5 text-red-500 shadow"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      <Link to={`/menu/${menu.id}`} className="flex flex-col gap-2">
        <ImageSlot src={menu.imageUrl} alt={menu.name} className="h-[110px] w-full md:h-[120px] lg:h-[160px]" />
        <span className="text-sm font-bold text-primary">{menu.name}</span>
      </Link>
    </div>
  );
}

export default MenuCard;
