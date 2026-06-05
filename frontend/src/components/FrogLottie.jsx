import React from 'react';
import Lottie from 'lottie-react';
import frogRegularIdle from '../assets/FrogRegularIdle.json';

const LottieComponent = typeof Lottie === 'function' ? Lottie : Lottie?.default;

export function Frog() {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm mx-auto transition-all hover:shadow-2xl">
      
      {/* Container to restrict the Lottie animation scaling */}
      <div className="w-64 h-64 flex items-center justify-center overflow-hidden">
        {LottieComponent ? (
          <LottieComponent
            animationData={frogRegularIdle}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <p className="text-xs text-rose-600 font-bold">Animation failed to load.</p>
        )}
      </div>

      {/* Status Badges underneath your companion */}
      <div className="mt-4 text-center">
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-black rounded-full uppercase tracking-wider">
          Status: Regular
        </span>
        <h3 className="text-xl font-black text-slate-800 mt-2">Your Budget Companion</h3>
        <p className="text-xs text-slate-400 mt-1">Keep your spending low to keep him happy!</p>
      </div>

    </div>
  );
}

export default Frog;