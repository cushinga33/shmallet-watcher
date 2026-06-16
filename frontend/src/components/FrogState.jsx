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
  fat: { src: FrogMediumFat, label: "Plump & Thriving!", color: "text-teal-500" },
  super_fat: { src: FrogFat, label: "Maximum Absolute Unit", color: "text-indigo-500" }
};

export function FrogState({ weightState = 'regular', happiness = 100 }) {
  const current = stateMap[weightState] || stateMap.regular;

  return (
    <div className="flex flex-col items-center h-full w-full">
      {/* Frog Graphic Frame */}
      <div className="relative flex items-center justify-center h-full w-full">
        <img 
          src={current.src} 
          alt="Your Budget Frog Companion" 
          className="w-[75%] h-[65%] object-contain transition-transform duration-300 group-hover:scale-105 z-1"
        />
      </div>
    </div>
  );
}