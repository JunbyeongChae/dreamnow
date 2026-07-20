import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMenus } from "../api/menus";
import type { MenuCategory, MenuSubCategory } from "../types/menu";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useAuthStore } from "../store/authStore";
import CategorySidebar from "../components/menu/CategorySidebar";
import CategoryTabBar from "../components/menu/CategoryTabBar";
import MenuCard from "../components/menu/MenuCard";
import { CATEGORIES, SUB_CATEGORIES } from "../components/menu/categoryData";
import MenuForm from "../components/admin/MenuForm";

function MenuPage() {
  const breakpoint = useBreakpoint();
  const { user, isAdminMode } = useAuthStore();
  const showAdminForm = user?.role === "admin" && isAdminMode;
  const [category, setCategory] = useState<MenuCategory>("season");
  const [subCategory, setSubCategory] = useState<MenuSubCategory>("coffee");

  const selection = { category, subCategory: category === "beverage" ? subCategory : null };

  const { data: menus, isLoading } = useQuery({
    queryKey: ["menus", category, category === "beverage" ? subCategory : null],
    queryFn: () => getMenus(category, category === "beverage" ? subCategory : undefined),
  });

  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label;
  const subCategoryLabel = SUB_CATEGORIES.find((s) => s.value === subCategory)?.label;

  const handleSelectCategory = (next: MenuCategory) => setCategory(next);
  const handleSelectSubCategory = (next: MenuSubCategory) => {
    setCategory("beverage");
    setSubCategory(next);
  };

  return (
    <div className="px-4 py-8 md:px-8">
      {breakpoint === "mobile" ? (
        <CategoryTabBar
          selection={selection}
          onSelectCategory={handleSelectCategory}
          onSelectSubCategory={handleSelectSubCategory}
        />
      ) : null}

      <div className="mt-6 flex gap-8">
        {breakpoint !== "mobile" && (
          <CategorySidebar
            selection={selection}
            onSelectCategory={handleSelectCategory}
            onSelectSubCategory={handleSelectSubCategory}
          />
        )}

        <div className="flex-1">
          {showAdminForm && (
            <div className="mb-6">
              <MenuForm />
            </div>
          )}

          {breakpoint === "desktop" && (
            <h2 className="mb-4 text-lg font-black text-primary">
              {categoryLabel}
              {category === "beverage" && ` · ${subCategoryLabel}`}
            </h2>
          )}

          {!isLoading && menus?.length === 0 && (
            <p className="text-sm text-text-muted">등록된 메뉴가 없습니다</p>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {menus?.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
