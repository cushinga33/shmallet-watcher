import React, { useState, useEffect, useCallback, useRef } from "react";
import { FrogState } from '../components/FrogState';
import Lilypad from '../assets/Lilypad.svg';
import { getCategoryIconByName } from "../assets/categoryIcons";
import { userColorChoices } from "../assets/userColorChoices";
import { fetchTransactions as fetchTransactionsApi } from "../services/transactionService";
import { fetchCategories as fetchCategoriesApi } from "../services/categoryService";
import { fetchCards as fetchCardsApi } from "../services/cardService";
import { EditTransactionModal } from "../components/EditTransactionModal";

const MODAL_ANIMATION_MS = 300;

export function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cards, setCards] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [editTransactionModal, setEditTransactionModal] = useState(false);
    const [editTransactionModalClosing, setEditTransactionModalClosing] = useState(false);
    const editTransactionModalTimeoutRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const closeEditTransactionModal = useCallback(() => {
        if (!editTransactionModal || editTransactionModalClosing) {
            return;
        }

        setEditTransactionModalClosing(true);

        if (editTransactionModalTimeoutRef.current) {
            window.clearTimeout(editTransactionModalTimeoutRef.current);
        }

        editTransactionModalTimeoutRef.current = window.setTimeout(() => {
            setEditTransactionModal(false);
            setEditTransactionModalClosing(false);
            editTransactionModalTimeoutRef.current = null;
        }, MODAL_ANIMATION_MS);
    }, [editTransactionModal, editTransactionModalClosing]);

    useEffect(()=> {
        const fetchTransactions = async () => {
            try {
                const data = await fetchTransactionsApi();
                setTransactions(data);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    useEffect(() => {
        const loadCategoriesAndCards = async () => {
            try {
                const [categoriesData, cardsData] = await Promise.all([
                    fetchCategoriesApi({ includeArchived: true }),
                    fetchCardsApi({ includeArchived: true }),
                ]);

                setCategories(categoriesData || []);
                setCards(cardsData || []);
            } catch {
                // Keep transaction history usable even if metadata lists fail.
            }
        };

        loadCategoriesAndCards();
    }, []);

    useEffect(() => {
        return () => {
            if (editTransactionModalTimeoutRef.current) {
                window.clearTimeout(editTransactionModalTimeoutRef.current);
            }
        };
    }, []);
    

    if (loading) {
        return (
            <div className="p-8 text-green-100 font-bold w-full text-center animate-pulse">Mmmm flies ...</div>
        )
    }
    if (error) return <div className="p-8 text-rose-300 font-bold w-full text-center">Uh oh ...{error}</div>;

    const getCategoryIcon = (iconName, color) => {
        return getCategoryIconByName(iconName, color);
    }

    const getCategoryForTransaction = (transaction) => {
        if (!transaction) {
            return null;
        }

        const mappedCategory = categories.find((category) => category.id === transaction.category_id);
        return mappedCategory || transaction.category || null;
    };

    const colors = userColorChoices;
    return (
        <div className="flex flex-1 w-full h-screen items-center justify-start flex-col gap-2 px-2">
            <div className="flex flex-col bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full max-h-[80vh] border-green-100/15 border-1 backdrop-blur-sm shadow-sm backdrop-brightness-95">
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
                    <ul className="w-full max-w-3xl flex flex-col overflow-y-auto mt-4">
                        {transactions.map((transaction) => {
                            const resolvedCategory = getCategoryForTransaction(transaction);

                            return (
                            <li key={transaction.id} className="px-1.5 py-0.5">
                                <button
                                    className="w-full h-full flex flex-col"
                                    onClick={() => {
                                        if (editTransactionModalTimeoutRef.current) {
                                            window.clearTimeout(editTransactionModalTimeoutRef.current);
                                            editTransactionModalTimeoutRef.current = null;
                                        }

                                        setSelectedTransaction(transaction);
                                        setEditTransactionModalClosing(false);
                                        setEditTransactionModal(true);
                                    }}
                                >
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-2 w-3/4">
                                            <div className="w-8 h-8 rounded-full aspect-square flex items-center justify-center bg-green-100">
                                                {getCategoryIcon(resolvedCategory?.icon, colors[resolvedCategory?.color])}
                                            </div>
                                            <span className="font-semibold text-green-100 text-xl truncate">{transaction.description}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className={`font-bold text-lg flex gap-1 items-center ${resolvedCategory?.type === "income" ? "text-green-300" : "text-green-100" }`}>
                                                $ {transaction.amount} {resolvedCategory?.type === "income" ? "+" : "-"}
                                            </div>
                                            <div className="text-xs text-green-100 text-right">{transaction.date}</div>
                                        </div>

                                    </div>
                                </button>
                                <div className="h-[1px] bg-green-100/15 rounded-full" />

                            </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {editTransactionModal && (
                <EditTransactionModal
                    isClosing={editTransactionModalClosing}
                    onClose={closeEditTransactionModal}
                    onTransactionUpdated={(updatedTransaction) => {
                        setTransactions((previousTransactions) =>
                            previousTransactions.map((transaction) =>
                                transaction.id === updatedTransaction.id ? updatedTransaction : transaction,
                            ),
                        );
                        closeEditTransactionModal();
                    }}
                    onTransactionDeleted={(transactionId) => {
                        setTransactions((previousTransactions) =>
                            previousTransactions.filter((transaction) => transaction.id !== transactionId),
                        );
                        setSelectedTransaction(null);
                        closeEditTransactionModal();
                    }}
                    selectedTransaction={selectedTransaction}
                    categories={categories}
                    cards={cards}
                />
            )}
            
        </div>
    )
}