import React, {useState, useEffect} from "react";
import { FrogState } from '../components/FrogState';
import {Frog} from '../components/FrogLottie';
import Lilypad from '../assets/Lilypad.svg';
import { Stats } from '../components/Stats';


export function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-1 justify-center">
      <div className="flex flex-col h-full items-center w-full px-2 pb-6">
        <div className="absolute z-20 flex items-center justify-center w-full">          
          <Stats />
        </div>
        <div className="flex flex-col w-full h-full relative justify-end floatAnimation pointer-events-none">
          <img src={Lilypad} alt="Lilypad" className="absolute bottom-0 object-contain" />
          <FrogState weightState="super_skinny" happiness={80} />
        </div>

      </div>
    </div>
  );
}
