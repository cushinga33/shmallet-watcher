import React from 'react';

import FrogSuperSkinny from '../assets/FrogSuperSkinnyai.svg';
import FrogSkinny from '../assets/FrogSkinny.svg';
import FrogRegular from '../assets/FrogRegular.svg';
import FrogMediumFat from '../assets/FrogMediumFat.svg';
import FrogFat from '../assets/FrogFat.svg';

const stateMap = {
  super_skinny: { src: FrogSuperSkinny, label: "Super Skinny / Underfed", color: "text-rose-500" },
  skinny: { src: FrogSkinny, label: "Skinny / Hungry", color: "text-amber-500" },
  regular: { src: FrogRegular, label: "Healthy & Balanced", color: "text-emerald-500" },
  medium_fat: { src: FrogMediumFat, label: "Plump & Thriving!", color: "text-teal-500" },
  fat: { src: FrogFat, label: "Maximum Absolute Unit", color: "text-indigo-500" }
};

export function FrogState({ weightState = 'regular', happiness = 100 }) {
  const current = stateMap[weightState] || stateMap.regular;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-sm mx-auto">
      {/* Happiness/Status Bar */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
          <span className={current.color}>{current.label}</span>
          <span>{happiness}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${happiness}%` }}
          />
        </div>
      </div>

      {/* Frog Graphic Frame */}
      <div className="relative w-48 h-48 flex items-center justify-center p-2 group">
        <img 
          src={current.src} 
          alt="Your Budget Frog Companion" 
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </div>
  );
}