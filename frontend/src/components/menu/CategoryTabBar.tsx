import type { CategoryNavProps } from "./categoryData";
import { CATEGORIES, SUB_CATEGORIES } from "./categoryData";

function CategoryTabBar({ selection, onSelectCategory, onSelectSubCategory }: CategoryNavProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 overflow-x-auto px-4">
        {CATEGORIES.map((cat) => {
          const active = selection.category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                active ? "bg-primary text-white" : "border border-input-border text-text-muted"
              }`}
            >
              {cat.label}
              {cat.value === "beverage" && " ▾"}
            </button>
          );
        })}
      </div>

      {selection.category === "beverage" && (
        <div className="flex gap-2 overflow-x-auto px-4">
          {SUB_CATEGORIES.map((sub) => {
            const active = selection.subCategory === sub.value;
            return (
              <button
                key={sub.value}
                onClick={() => onSelectSubCategory(sub.value)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                  active ? "bg-primary text-white" : "border border-input-border text-text-muted"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryTabBar;
