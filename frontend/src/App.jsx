import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { supabase } from './config/supabaseClient';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Files } from './pages/Files';
import { Settings } from './pages/Settings';
import { Background } from './components/Background';

import './App.css'

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    });

    return () => subscription.unsubscribe()
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-bold text-slate-400 text-sm tracking-wider animate-pulse">
        La La La loading your pond he he he
      </div>
    );
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="isolate h-dvh w-dvw overflow-hidden text-slate-900">
      <Background />
      <div className="flex flex-col h-full w-full relative z-10">
        <Navbar email={session.user.email} />
        <main className="h-full w-full flex overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="files" element={<Files />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
