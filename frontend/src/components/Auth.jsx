import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { Background } from "./Background";
import { FrogState } from '../components/FrogState';
import Lilypad from '../assets/Lilypad.svg';


export function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isSignUp && passwordConfirm !== '') {
            if (password !== passwordConfirm) {
                setErrorMsg('Passwords must match!');
                setPasswordsMatch(false);
            } else {
                setErrorMsg('');
                setPasswordsMatch(true);
            }
        } else {
            setErrorMsg('');
            setPasswordsMatch(true);
        }
    }, [password, passwordConfirm, isSignUp]);

    const handleAuth = async (e) => {
        e.preventDefault();
        
        if (isSignUp && !passwordsMatch) return;

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccessMsg('Check your email for a confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-2 bg-slate-50">
            <Background />

            <div className="w-full p-8 bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm z-10 backdrop-brightness-90">
                <h2 className="text-4xl font-black text-center text-green-200 font-berky mb-2">
                    Frog Wallet
                </h2>
                <p className="text-sm text-center text-green-200 mb-6">
                    {isSignUp ? 'Create account to meet your frog' : 'Sign in to check on your frog'}
                </p>

                {errorMsg && <div className="p-3 mb-4 text-xs font-bold bg-rose-50 text-rose-600 rounded-xl">{errorMsg}</div>}
                {successMsg && <div className="p-3 mb-4 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-xl">{successMsg}</div>}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-green-200 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="froggy@pond.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-green-200 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {isSignUp && (
                        <div>
                            <label className="block text-xs font-bold uppercase text-green-200 mb-1">Confirm Password</label>
                            <input 
                                type="password" 
                                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-colors ${
                                    !passwordsMatch && passwordConfirm !== '' 
                                        ? 'border-rose-300 focus:border-rose-500' 
                                        : 'border-slate-200 focus:border-emerald-500'
                                }`}
                                placeholder="••••••••"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading || (isSignUp && (!passwordsMatch || passwordConfirm === ''))}
                        className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setPasswordConfirm('');
                        }} 
                        className="text-xs font-bold text-green-200 hover:underline"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
            <div className="flex absolute bottom-0 h-[50vh] w-full floatAnimation pointer-events-none">
                <img src={Lilypad} alt="Lilypad" className="absolute -bottom-25 w-full h-full object-contain" />
                <FrogState weightState="super_fat" happiness={80} />
            </div>
        </div>
    );
}