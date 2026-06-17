import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FrogState } from '../components/FrogState';
import Lilypad from '../assets/Lilypad.svg';
import { getCategoryIconByName } from "../assets/categoryIcons";
import { userColorChoices } from "../assets/userColorChoices";
import { FaFilter, FaXmark } from "react-icons/fa6";
import { fetchTransactions as fetchTransactionsApi } from "../services/transactionService";
import { fetchCategories as fetchCategoriesApi } from "../services/categoryService";
import { fetchCards as fetchCardsApi } from "../services/cardService";
import { EditTransactionModal } from "../components/EditTransactionModal";

const MODAL_ANIMATION_MS = 300;

const defaultFilters = {
    type: "all",
    categoryId: "all",
    cardId: "all",
    recurring: "all",
    startDate: "",
    endDate: "",
};

function normalizeDate(dateValue) {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
}

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
    const [filters, setFilters] = useState(defaultFilters);
    const [draftFilters, setDraftFilters] = useState(defaultFilters);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

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
    

    const getCategoryForTransaction = (transaction) => {
        if (!transaction) {
            return null;
        }

        const mappedCategory = categories.find((category) => category.id === transaction.category_id);
        return mappedCategory || transaction.category || null;
    };

    const getCardForTransaction = (transaction) => {
        if (!transaction) {
            return null;
        }

        const mappedCard = cards.find((cardItem) => cardItem.id === transaction.card_id);
        return mappedCard || transaction.card || null;
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const resolvedCategory = getCategoryForTransaction(transaction);

            if (filters.type !== "all" && resolvedCategory?.type !== filters.type) {
                return false;
            }

            if (filters.categoryId !== "all" && String(transaction.category_id) !== String(filters.categoryId)) {
                return false;
            }

            if (filters.cardId !== "all" && String(transaction.card_id) !== String(filters.cardId)) {
                return false;
            }

            const isRecurring = transaction.timeframe && transaction.timeframe !== "Once";
            if (filters.recurring === "recurring" && !isRecurring) {
                return false;
            }

            if (filters.recurring === "once" && isRecurring) {
                return false;
            }

            const transactionDate = normalizeDate(transaction.date);
            if (!transactionDate) {
                return false;
            }

            if (filters.startDate) {
                const startDate = normalizeDate(filters.startDate);
                if (startDate && transactionDate < startDate) {
                    return false;
                }
            }

            if (filters.endDate) {
                const endDate = normalizeDate(filters.endDate);
                if (endDate && transactionDate > endDate) {
                    return false;
                }
            }

            return true;
        });
    }, [transactions, filters, categories, cards]);

    const activeFilterPills = useMemo(() => {
        const pills = [];

        if (filters.type !== "all") {
            pills.push({ key: "type", label: filters.type === "income" ? "Income" : "Expense" });
        }

        if (filters.categoryId !== "all") {
            const categoryName = categories.find((categoryItem) => String(categoryItem.id) === String(filters.categoryId))?.name;
            pills.push({ key: "categoryId", label: categoryName ? `Category: ${categoryName}` : "Category" });
        }

        if (filters.cardId !== "all") {
            const cardName = cards.find((cardItem) => String(cardItem.id) === String(filters.cardId))?.name;
            pills.push({ key: "cardId", label: cardName ? `Card: ${cardName}` : "Card" });
        }

        if (filters.recurring !== "all") {
            pills.push({ key: "recurring", label: filters.recurring === "recurring" ? "Recurring" : "One-Time" });
        }

        if (filters.startDate || filters.endDate) {
            const startLabel = filters.startDate || "...";
            const endLabel = filters.endDate || "...";
            pills.push({ key: "dateRange", label: `Date: ${startLabel} to ${endLabel}` });
        }

        return pills;
    }, [filters, categories, cards]);

    const applyFilters = () => {
        setFilters(draftFilters);
        setFilterModalOpen(false);
    };

    const clearDraftFilters = () => {
        setDraftFilters(defaultFilters);
    };

    const clearAllFilters = () => {
        setFilters(defaultFilters);
        setDraftFilters(defaultFilters);
    };

    const clearSingleFilter = (filterKey) => {
        if (filterKey === "dateRange") {
            const nextFilters = { ...filters, startDate: "", endDate: "" };
            setFilters(nextFilters);
            setDraftFilters(nextFilters);
            return;
        }

        const resetValue = defaultFilters[filterKey];
        const nextFilters = { ...filters, [filterKey]: resetValue };
        setFilters(nextFilters);
        setDraftFilters(nextFilters);
    };

    const getCategoryIcon = (iconName, color) => {
        return getCategoryIconByName(iconName, color);
    };

    if (loading) {
        return (
            <div className="p-8 text-green-100 font-bold w-full text-center animate-pulse">Mmmm flies ...</div>
        );
    }

    if (error) {
        return <div className="p-8 text-rose-300 font-bold w-full text-center">Uh oh ...{error}</div>;
    }

    const colors = userColorChoices;
    return (
        <div className="flex flex-1 w-full max-h-screen items-center justify-start flex-col gap-2">
            <div className="flex flex-col py-2 px-1 w-full h-full overflow-y-auto">
                <div className="w-full flex items-center justify-between gap-2 px-2">
                    <div className="w-10" />
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-3xl font-berky text-green-200 text-center">
                            History
                        </h1>
                        <div className="w-12 h-12 -mt-2 relative floatAnimationSmall">
                            <img src={Lilypad} alt="Lilypad" className="absolute -bottom-3 w-full h-full object-contain" />
                            <FrogState weightState="super_fat" happiness={80} />
                        </div>
                    </div>
                    <button
                        type="button"
                        className="w-10 h-10 rounded-xl bg-green-100 text-green-500 flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                        aria-label="Open transaction filters"
                        onClick={() => {
                            setDraftFilters(filters);
                            setFilterModalOpen(true);
                        }}
                    >
                        <FaFilter className="text-lg" color="" />
                    </button>
                </div>

                {activeFilterPills.length > 0 && (
                    <div className="w-full px-2 mt-2 flex flex-wrap gap-2">
                        {activeFilterPills.map((pill) => (
                            <button
                                key={pill.key}
                                type="button"
                                className="flex items-center gap-1.5 bg-green-100/90 text-slate-700 rounded-full px-3 py-1 text-xs font-semibold"
                                onClick={() => clearSingleFilter(pill.key)}
                                title="Remove filter"
                            >
                                <span>{pill.label}</span>
                                <FaXmark className="text-[10px]" />
                            </button>
                        ))}
                        <button
                            type="button"
                            className="bg-rose-400/90 text-green-100 rounded-full px-3 py-1 text-xs font-bold"
                            onClick={clearAllFilters}
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {transactions.length === 0 ? (
                    <div className="p-8 text-green-100 font-bold w-full text-center">No transactions yet ...</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-green-100 font-bold w-full text-center">No transactions match those filters.</div>
                ) : (
                    <ul className="w-full max-w-3xl flex flex-col overflow-y-auto mt-4">
                        {filteredTransactions.map((transaction) => {
                            const resolvedCategory = getCategoryForTransaction(transaction);
                            const resolvedCard = getCardForTransaction(transaction);

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
                                            <div className="flex flex-col items-start">
                                                <span className="font-semibold text-green-100 text-xl truncate max-w-[190px] sm:max-w-[260px]">{transaction.description}</span>
                                                <span className="text-[11px] text-green-100/80 truncate max-w-[190px] sm:max-w-[260px]">
                                                    {resolvedCard?.name || "No card"}
                                                    {transaction.timeframe && transaction.timeframe !== "Once" ? ` • Recurring ${transaction.timeframe}` : " • One-Time"}
                                                </span>
                                            </div>
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

            {filterModalOpen && (
                <div
                    className="fixed inset-0 z-50 backdrop-blur-sm backdrop-brightness-75 flex items-end"
                    onClick={() => setFilterModalOpen(false)}
                >
                    <div
                        className="bg-linear-to-br from-green-100/30 to-green-200/10 p-3 border-green-100/15 border-1 backdrop-blur-sm shadow-sm w-full h-[80%] rounded-t-3xl flex flex-col gap-3 slideInUpAnimation"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="w-full flex items-center justify-between">
                            <h2 className="text-3xl font-berky text-green-200">Filters</h2>
                            <button
                                type="button"
                                className="bg-rose-400 px-4 py-2 rounded-xl text-green-100 font-bold shadow-md"
                                onClick={() => setFilterModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="w-full overflow-y-auto pr-1 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-green-200 font-semibold">Income or Expense</label>
                                    <select
                                        className="bg-green-100 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                                        value={draftFilters.type}
                                        onChange={(event) => setDraftFilters((current) => ({ ...current, type: event.target.value }))}
                                    >
                                        <option value="all">All</option>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-green-200 font-semibold">Category</label>
                                    <select
                                        className="bg-green-100 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                                        value={String(draftFilters.categoryId)}
                                        onChange={(event) => setDraftFilters((current) => ({ ...current, categoryId: event.target.value }))}
                                    >
                                        <option value="all">All categories</option>
                                        {categories.map((categoryItem) => (
                                            <option key={categoryItem.id} value={categoryItem.id}>{categoryItem.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-green-200 font-semibold">Card</label>
                                    <select
                                        className="bg-green-100 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                                        value={String(draftFilters.cardId)}
                                        onChange={(event) => setDraftFilters((current) => ({ ...current, cardId: event.target.value }))}
                                    >
                                        <option value="all">All cards</option>
                                        {cards.map((cardItem) => (
                                            <option key={cardItem.id} value={cardItem.id}>{cardItem.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-green-200 font-semibold">Recurring</label>
                                    <select
                                        className="bg-green-100 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                                        value={draftFilters.recurring}
                                        onChange={(event) => setDraftFilters((current) => ({ ...current, recurring: event.target.value }))}
                                    >
                                        <option value="all">All</option>
                                        <option value="recurring">Recurring only</option>
                                        <option value="once">One-time only</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-green-200 font-semibold">Start Date</label>
                                    <input
                                        type="date"
                                        className="bg-green-100 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                                        value={draftFilters.startDate}
                                        onChange={(event) => setDraftFilters((current) => ({ ...current, startDate: event.target.value }))}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-green-200 font-semibold">End Date</label>
                                    <input
                                        type="date"
                                        className="bg-green-100 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                                        value={draftFilters.endDate}
                                        onChange={(event) => setDraftFilters((current) => ({ ...current, endDate: event.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                className="bg-green-100 text-slate-700 font-bold rounded-xl py-2"
                                onClick={clearDraftFilters}
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                className="bg-[#4aba68] text-green-100 font-bold rounded-xl py-2"
                                onClick={applyFilters}
                            >
                                Apply Filters ({activeFilterPills.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    )
}