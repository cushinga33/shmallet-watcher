import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabaseClient';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
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
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-bold text-slate-400 text-sm tracking-wider animate-pulse">
        La La La loading your pond he he
      </div>
    );
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="relative isolate min-h-screen text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Background />
      <div className="relative z-10">
        <Navbar email={session.user.email} />
        <main>
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

export default App
