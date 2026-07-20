import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getMenu } from "../api/menus";
import ImageSlot from "../components/common/ImageSlot";

function MenuDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: menu, isLoading } = useQuery({
    queryKey: ["menu", id],
    queryFn: () => getMenu(Number(id)),
  });

  if (isLoading) return null;
  if (!menu) return <p className="px-4 py-8 text-sm text-text-muted">메뉴를 찾을 수 없습니다</p>;

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-6 lg:flex-row">
        <ImageSlot
          src={menu.imageUrl}
          alt={menu.name}
          className="h-[280px] w-full flex-shrink-0 md:h-[320px] lg:h-[440px] lg:w-[440px]"
        />
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-2xl text-primary">{menu.name}</h1>
          <span className="text-xl font-black text-primary">{menu.price.toLocaleString()}원</span>
          {menu.description && <p className="text-sm leading-relaxed text-primary">{menu.description}</p>}
        </div>
      </div>
    </div>
  );
}

export default MenuDetailPage;
