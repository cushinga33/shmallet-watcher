import React, {useState, useEffect} from "react";
import { FrogState } from '../components/FrogState';
import {Frog} from '../components/FrogLottie';
import Lilypad from '../assets/Lilypad.svg';
import { Stats } from '../components/Stats';


export function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-1 justify-center">
      <div className="grid grid-cols-1 grid-rows-2 gap-8 items-center flex w-full px-2 pb-6">
        <div className="relative z-20 flex flex-1 h-full items-center justify-center w-full">          
          <Stats />
        </div>
        <div className="md:col-span-1 flex flex-1 h-full w-full relative floatAnimation pointer-events-none">
          <img src={Lilypad} alt="Lilypad" className="absolute -bottom-25 w-full h-full object-contain" />
          <FrogState weightState="super_fat" happiness={80} />
        </div>

      </div>
    </div>
  );
}
