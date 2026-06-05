// frontend/react/src/components/Navbar.jsx
import React from 'react';
import { supabase } from '../config/supabaseClient';

export function Navbar({ email }) {
  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Brand/Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-emerald-600">
            Shmallet Watcher
          </span>
        </div>

        {/* User Status & Actions */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            {email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}