import React, {useState, useEffect} from "react";
import { FrogState } from '../components/FrogState';
import {Frog} from '../components/FrogLottie';
import { Stats } from '../components/Stats';


export function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-1 justify-center">
        <div className="absolute z-20 flex items-center justify-center w-full">          
          <Stats />
        </div>
        <FrogState weightState="regular" happiness={80} />
    </div>
  );
}
