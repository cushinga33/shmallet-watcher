import React, {useState, useEffect} from "react";
import { FrogState } from './FrogState';
import {Frog} from './FrogLottie';

export function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left/Center Column: Focus on the Frog Pet Engine */}
        <div className="md:col-span-1">
          {/* <FrogState weightState="regular" happiness={80} /> */}
          <Frog />
        </div>

        {/* Right Column: Financial Data Placeholder */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-2">Financial Status</h2>
            <p className="text-sm text-slate-500">
              Your transaction pipelines and custom category limits will display here.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-2">Category Overview</h2>
            <p className="text-sm text-slate-500">
              Toggle specific budget constraints and track which overages are forgiven.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
