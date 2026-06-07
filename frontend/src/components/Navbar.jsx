// frontend/react/src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { IoMenu } from "react-icons/io5";

const MENU_ANIMATION_MS = 300;
const navLinkClasses = ({ isActive }) =>
  `block p-2 rounded-xl transition-colors ${isActive ? 'bg-green-100 font-semibold text-slate-700' : 'text-slate-600'}`;

export function Navbar({ email }) {
  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuClosing, setMenuClosing] = React.useState(false);
  const closeMenuTimeoutRef = React.useRef(null);
  const menuPanelRef = React.useRef(null);
  const menuButtonRef = React.useRef(null);

  const closeMenu = React.useCallback(() => {
    if (!menuOpen || menuClosing) {
      return;
    }

    setMenuClosing(true);

    if (closeMenuTimeoutRef.current) {
      window.clearTimeout(closeMenuTimeoutRef.current);
    }

    closeMenuTimeoutRef.current = window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
      closeMenuTimeoutRef.current = null;
    }, MENU_ANIMATION_MS);
  }, [menuOpen, menuClosing]);

  React.useEffect(() => {
    return () => {
      if (closeMenuTimeoutRef.current) {
        window.clearTimeout(closeMenuTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      const clickedInsidePanel = menuPanelRef.current?.contains(event.target);
      const clickedMenuButton = menuButtonRef.current?.contains(event.target);

      if (!clickedInsidePanel && !clickedMenuButton) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, closeMenu]);

  const handleMenuOpen = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }

    if (closeMenuTimeoutRef.current) {
      window.clearTimeout(closeMenuTimeoutRef.current);
      closeMenuTimeoutRef.current = null;
    }

    setMenuOpen(true);
    setMenuClosing(false);
  };

  return (
    <nav className="w-full z-50 p-4 sticky top-0">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Brand/Logo */}
        <div className="flex items-center gap-2">
          <span className="text-4xl tracking-tight text-green-200 font-berky">
            Shmallet Watcher
          </span>
        </div>

        {/* User Status & Actions */}
        <div className="flex items-center gap-4">
          {/* <span className="hidden sm:inline text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            {email}
          </span> */}

          <div className="md:hidden">
            <button ref={menuButtonRef} onClick={handleMenuOpen}>
              <IoMenu className="w-10 h-10 text-green-200" />
            </button>
          </div>


        </div>
      </div>
      {menuOpen && (
      <div className="md:hidden absolute top-16 left-0 w-full h-screen backdrop-blur-sm p-2 transition-all duration-300">
        <div ref={menuPanelRef} className={`self-center w-full bg-green-200 rounded-2xl py-4 px-2 flex flex-col gap-4 justify-between ${menuClosing ? "slideOutAnimation" : "slideInAnimation"}`}>
          <ul className="flex flex-col gap-4">
              <li><NavLink to="/" end className={navLinkClasses} onClick={closeMenu}>Dashboard</NavLink></li>
              <li><NavLink to="/transactions" className={navLinkClasses} onClick={closeMenu}>Transactions</NavLink></li>
              <li><NavLink to="/files" className={navLinkClasses} onClick={closeMenu}>Files</NavLink></li>
              <li><NavLink to="/settings" className={navLinkClasses} onClick={closeMenu}>Settings</NavLink></li>
          </ul>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#4aba68] text-green-100 text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            Log Out
          </button>
        </div>
      </div>
      )}
    </nav>
  );
}