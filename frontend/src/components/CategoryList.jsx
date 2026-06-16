import React from "react";
import { getCategoryIconByName } from "../assets/categoryIcons";
import { userColorChoices } from "../assets/userColorChoices";
export function CategoryList({ loading, errorMsg, categories, formattedCategoryType, onEdit }) {
  if (loading) {
    return <div className="p-4 text-green-100 w-full text-center animate-pulse">Loading categories...</div>;
  }

  if (errorMsg) {
    return <div className="p-4 text-green-100 w-full text-center">{errorMsg}</div>;
  }

  if (categories.length === 0) {
    return <div className="p-4 text-green-100 w-full text-center">Add some categories!</div>;
  }

  const getCategoryIcon = (iconName, color) => {
    return getCategoryIconByName(iconName, color);
  }
  const colors = userColorChoices;
  return (
    <div>
      {/* <div className="flex justify-between items-center pt-1">
        <h2 className="text-lg font-semibold text-slate-600">Name</h2>
        <h2 className="text-lg font-semibold text-slate-600">Budget Limit</h2>
      </div> */}
      <ul className="w-full max-w-3xl flex flex-col">
        {categories.map((category) => (
          <li key={category.id} className="py-1">
            <button className="w-full h-full flex flex-col" onClick={() => onEdit(category)}>
              <div className="flex justify-between">
                <div className="flex items-center justify-start gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                    {getCategoryIcon(category.icon, colors[category.color] || "#ffffff")}
                  </div>
                  <span className="font-semibold text-green-100 text-lg">{category.name}</span>
                  {category.is_archived && <span className="text-xs text-green-300">(Archived)</span>}
                </div>
                {category.type === "expense" ? 
                  <div className="text-lg font-bold text-green-200 flex gap-1 items-center">
                    ${category.budget_limit} {category.timeframe && <span className="text-lg font-normal text-green-200">/ {category.timeframe}</span>}
                  </div> : 
                  <div className="text-lg font-bold text-green-200 flex gap-1 items-center">
                    Income
                  </div>}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
