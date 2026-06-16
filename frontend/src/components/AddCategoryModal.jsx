import React, { useState } from "react";
import FrogHead from "../assets/FrogHead.svg";
import { createCategory } from "../services/categoryService";
import { FaChevronDown, FaKey } from "react-icons/fa6";
import { buildCategoryIcons } from "../assets/categoryIcons";
import { userColorChoices } from "../assets/userColorChoices";



export function AddCategoryModal({ isClosing, onClose, onCategoryAdded }) {
    const [newCategory, setNewCategory] = useState("");
    const [selectedType, setSelectedType] = useState(0);
    const [typeModalOpen, setTypeModalOpen] = useState(false);
    const [categoryColor, setCategoryColor] = useState(6);
    const [categoryBudget, setCategoryBudget] = useState("");
    const [categoryIcon, setCategoryIcon] = useState(0);
    const [categoryTimeframe, setCategoryTimeframe] = useState(0);

    const [iconModalOpen, setIconModalOpen] = useState(false);
    const [colorModalOpen, setColorModalOpen] = useState(false);
    const [timeframeModalOpen, setTimeframeModalOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const types = ["Expense", "Income"];
    const timeframes = ["Monthly", "Bi-Weekly", "Weekly", "Daily"];

    const icons = buildCategoryIcons(userColorChoices[categoryColor], 24);

    const handleAddCategory = async (event) => {
        event.preventDefault();

        if (!newCategory.trim()) {
        setErrorMsg("Category name is required.");
        return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
        const category = await createCategory({
            name: newCategory.trim(),
            type: types[selectedType],
            color: categoryColor,
            icon: icons[categoryIcon].name,
            budget_limit: categoryBudget ? parseFloat(categoryBudget) : null,
            timeframe: timeframes[categoryTimeframe],
        });

        onCategoryAdded(category);
        } catch (error) {
        setErrorMsg(error.message);
        } finally {
        setLoading(false);
        }
    };

  return (
    <div
      className={`fixed inset-0 w-full h-screen flex top-0 items-end ${!isClosing ? "backdrop-blur-sm backdrop-brightness-75" : ""} transition-all duration-300`}
      onClick={onClose}
    >
      <div
        className={`bg-linear-to-br from-green-100/30 to-green-200/10 p-3 border-green-100/15 border-1 backdrop-blur-sm shadow-sm w-full h-[85%] rounded-t-3xl flex flex-col gap-2 ${isClosing ? "slideOutDownAnimation" : "slideInUpAnimation"}`}
        onClick={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) { setTypeModalOpen(false); setIconModalOpen(false); setColorModalOpen(false); setTimeframeModalOpen(false); } }}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <h1 className="text-3xl font-berky text-green-200 text-left flex items-center gap-2">
            Add Category
          </h1>
          <button
            onClick={onClose}
            className="bg-rose-400 px-4 py-2 rounded-xl text-green-100 font-bold shadow-md"
          >
            Cancel
          </button>
        </div>

        <form className="w-full grid grid-cols-6 grid-rows-3 gap-2" onSubmit={handleAddCategory}>
          <div className="flex flex-col items-center justify-center w-full col-span-4">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Category Name</h1>
            <input
              type="text"
              placeholder="Work Payroll"
              className="w-full px-4 py-2 rounded-xl bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 col-span-4 shadow-sm placeholder:text-slate-400 text-slate-600"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            />
          </div>

          <div className="relative flex flex-col items-center justify-center w-full col-span-2">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Type</h1>
            <button
              type="button"
              className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center justify-between"
              onClick={() => setTypeModalOpen((open) => {
                setIconModalOpen(false);
                setColorModalOpen(false);
                setTimeframeModalOpen(false);
                return !open
              })}
            >
              {types[selectedType]}
              <FaChevronDown className={`ml-2 ${typeModalOpen ? "transform rotate-180" : ""}`} />
            </button>
            {typeModalOpen && (
              <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg p-1 mt-2 flex flex-col z-20 w-full">
                {types.map((type, index) => (
                  <div
                    key={type}
                    className="p-2 rounded cursor-pointer"
                    onClick={() => {
                      setSelectedType(index);
                      setTypeModalOpen(false);
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex flex-col items-center justify-center w-full col-span-1">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Color</h1>
            <button type="button" className="w-full h-full p-2 bg-green-100 rounded-xl" onClick={() => setColorModalOpen((open) => {
              setIconModalOpen(false);
              setTypeModalOpen(false);
              setTimeframeModalOpen(false);
              return !open;
            })}>
              <div className="rounded w-full h-full items-center justify-center flex" style={{ backgroundColor: userColorChoices[categoryColor] }} />              
            </button>
            {colorModalOpen && (
              <div className="absolute top-full left-0 bg-green-100 p-2 rounded-xl shadow-lg mt-2 grid grid-cols-4 gap-1 z-20 w-55">
                {userColorChoices.map((color, index) => (
                  <div
                    key={color}
                    className="p-2 rounded cursor-pointer items-center justify-center flex aspect-square"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setCategoryColor(index);
                      setColorModalOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="relative flex flex-col items-center justify-center w-full col-span-1">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Icon</h1>
            <button
              type="button"
              className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full h-full flex items-center justify-center"
              onClick={() => setIconModalOpen((open) => {
                setColorModalOpen(false);
                setTypeModalOpen(false);
                setTimeframeModalOpen(false);
                return !open;
              })}
            >
              {icons[categoryIcon].icon}
              
            </button>
            {iconModalOpen && (
              <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg p-1 mt-2 grid grid-cols-4 gap-2 z-20 w-55">
                {icons.map((icon, key) => (
                  <div
                    key={icon.name}
                    className="p-2 rounded cursor-pointer items-center justify-center flex"
                    onClick={() => {
                      setCategoryIcon(key);
                      setIconModalOpen(false);
                    }}
                  >
                    {icon.icon}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedType === 0 && <div className="flex flex-col items-center justify-center w-full col-span-2 relative">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Budget Limit</h1>
            <input
              type="number"
              placeholder="0.00"
              className="w-full px-4 py-2 rounded-xl bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 col-span-4 shadow-sm placeholder:text-slate-400 text-slate-600 text-right"
              value={categoryBudget}
              onChange={(event) => setCategoryBudget(event.target.value)}
            />
            <span className="text-xl font-bold text-green-400 absolute left-3 top-1/2">$</span>
          </div> 
          }

          {selectedType === 0 && 
          <div className="flex flex-col items-center justify-center w-full col-span-2 relative">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Timeframe</h1>
              <button
                type="button"
                className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full h-full flex items-center justify-between"
                onClick={() => setTimeframeModalOpen((open) => {
                  setColorModalOpen(false);
                  setTypeModalOpen(false);
                  setIconModalOpen(false);
                  return !open;
                })}
              >
                {timeframes[categoryTimeframe]}
                <FaChevronDown className={`ml-2 ${timeframeModalOpen ? "transform rotate-180" : ""}`} />
              </button>
              {timeframeModalOpen && (
                <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg p-2 mt-2 flex flex-col gap-2 z-20 w-full">
                  {timeframes.map((timeframe, index) => (
                    <div
                      key={index}
                      className="p-2 rounded cursor-pointer items-center flex"
                      onClick={() => {
                        setCategoryTimeframe(index);
                        setTimeframeModalOpen(false);
                      }}
                    >
                      {timeframe}
                    </div>
                  ))}
                </div>
              )}
          </div> 
          }
          
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-[#4aba68] text-green-100 font-berky text-3xl py-2 rounded-xl col-start-2 col-end-6 w-[50%] self-center -rotate-3 shadow-md floatAnimationSmall"
          >
            {loading ? "Saving..." : "Save"}
            <img src={FrogHead} alt="Frog Head" className="w-8 h-8 inline-block ml-2" />
          </button>

          {errorMsg && <p className="text-rose-400 text-sm col-span-6 text-center mt-2">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
}
