import React, { useState, useEffect} from "react";
import { supabase } from "../config/supabaseClient";
import { FrogState } from '../components/FrogState';
import Lilypad from '../assets/Lilypad.svg';

export function Transactions() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(()=> {
        const fetchTransactions = async () => {
            try {
                const {data: {session} } = await supabase.auth.getSession();
                if (!session) throw new Error('Not Authenticated');

                const response = await fetch(`${apiBaseUrl}/api/transactions`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                });

                const data = await response.json();
                setTransactions(data);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);
    

    if (loading) {
        return (
            <div className="p-8 text-green-100 font-bold w-full text-center animate-pulse">Mmmm flies ...</div>
        )
    }
    if (error) return <div className="p-8 text-rose-300 font-bold w-full text-center">Uh oh ...{error}</div>;
    return (
        <div className="flex flex-1 w-full h-screen items-center justify-start flex-col gap-2 px-2">
            <div className="flex flex-col bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm">
                <div className="w-full flex items-center justify-center gap-2">
                    <h1 className="text-3xl font-berky text-green-200 text-center">
                        History
                    </h1>
                    <div className="w-12 h-12 -mt-2 relative floatAnimationSmall">
                        <img src={Lilypad} alt="Lilypad" className="absolute -bottom-3 w-full h-full object-contain" />
                        <FrogState weightState="super_fat" happiness={80} />
                    </div>   
                </div>

                {transactions.length === 0 ? (
                    <div className="p-8 text-green-100 font-bold w-full text-center">No transactions yet ...</div>
                ) : (
                    <ul className="w-full max-w-3xl flex flex-col">
                        {transactions.map((transaction) => (
                            <li key={transaction.id} className="px-1.5 py-0.5">
                                <button className="w-full h-full flex flex-col">
                                    <div className="flex justify-between">
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-green-100 text-lg">{transaction.description}</span>
                                            <span className="text-xs text-green-100">{transaction.category?.name || transaction.category_id}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="font-bold text-lg text-green-200 flex gap-1 items-center">
                                                $ {transaction.amount}
                                            </div>
                                            <div className="text-xs text-green-100 text-right">{transaction.date}</div>
                                        </div>

                                    </div>
                                    <div className="h-[2px] bg-green-100/30 rounded-full" />
                                </button>

                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
        </div>
    )
}