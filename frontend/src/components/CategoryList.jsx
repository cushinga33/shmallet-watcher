import React from "react";

export function CategoryList({ loading, errorMsg, categories, formattedCategoryType }) {
  if (loading) {
    return <div className="p-4 text-green-100 w-full text-center animate-pulse">Loading categories...</div>;
  }

  if (errorMsg) {
    return <div className="p-4 text-green-100 w-full text-center">{errorMsg}</div>;
  }

  if (categories.length === 0) {
    return <div className="p-4 text-green-100 w-full text-center">Add some categories!</div>;
  }

  return (
    <ul className="w-full max-w-3xl flex flex-col">
      {categories.map((category) => (
        <li key={category.id} className="p-2">
          <button className="w-full h-full flex flex-col">
            <div className="flex justify-between">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-green-100 text-lg">{category.name}</span>
                <div className="text-md text-green-200 flex gap-1 items-center">
                  Budget Limit: ${category.budget_limit}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-green-100 text-right">{formattedCategoryType(category.type)}</div>
              </div>
            </div>
            <div className="h-[2px] bg-green-100/30 rounded-full" />
          </button>
        </li>
      ))}
    </ul>
  );
}
