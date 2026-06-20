import React from 'react';

import FrogSuperSkinny from '../assets/FrogSuperSkinnyai.svg';
import FrogSkinny from '../assets/FrogSkinny.svg';
import FrogRegular from '../assets/FrogRegular.svg';
import FrogMediumFat from '../assets/FrogMediumFat.svg';
import FrogFat from '../assets/FrogFat.svg';
import Lilypad from '../assets/Lilypad.svg';

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
    <div className="relative self-end h-[50dvh] w-dvw floatAnimation">
      {/* Frog Graphic Frame */}
        <img 
          src={current.src} 
          alt="Your Budget Frog Companion" 
          className="transfor object-contain aspect-square absolute -bottom-5 z-1"
          style={weightState === 'super_fat' || weightState === 'fat' ? { transform: 'scale(.75)' } : {'scale': '0.65'}}
        />
        <img src={Lilypad} alt="Lilypad" className="absolute bottom-0 object-contain" />

    </div>
  );
}