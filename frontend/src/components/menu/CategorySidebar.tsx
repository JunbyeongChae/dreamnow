import type { CategoryNavProps } from "./categoryData";
import { CATEGORIES, SUB_CATEGORIES } from "./categoryData";

function CategorySidebar({ selection, onSelectCategory, onSelectSubCategory }: CategoryNavProps) {
  return (
    <nav className="w-[180px] flex-shrink-0 lg:w-[260px]">
      <ul className="flex flex-col gap-1">
        {CATEGORIES.map((cat) => (
          <li key={cat.value}>
            <button
              onClick={() => onSelectCategory(cat.value)}
              className={`w-full py-2 text-left text-sm font-bold ${
                selection.category === cat.value ? "text-accent" : "text-primary"
              }`}
            >
              {cat.label}
            </button>

            {cat.value === "beverage" && selection.category === "beverage" && (
              <ul className="ml-4 flex flex-col gap-1">
                {SUB_CATEGORIES.map((sub) => (
                  <li key={sub.value}>
                    <button
                      onClick={() => onSelectSubCategory(sub.value)}
                      className={`w-full py-1 text-left text-sm ${
                        selection.subCategory === sub.value ? "text-accent" : "text-text-muted"
                      }`}
                    >
                      {sub.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default CategorySidebar;
