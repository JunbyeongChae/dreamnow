import { Link } from "react-router-dom";

import type { MenuListItem } from "../../types/menu";
import ImageSlot from "../common/ImageSlot";

interface MenuCardProps {
  menu: MenuListItem;
}

function MenuCard({ menu }: MenuCardProps) {
  return (
    <Link to={`/menu/${menu.id}`} className="flex flex-col gap-2">
      <ImageSlot src={menu.imageUrl} alt={menu.name} className="h-[110px] w-full md:h-[120px] lg:h-[160px]" />
      <span className="text-sm font-bold text-primary">{menu.name}</span>
    </Link>
  );
}

export default MenuCard;
