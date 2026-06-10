import React, { useCallback, useEffect, useRef, useState } from "react";
import { TbCategory2 } from "react-icons/tb";
import { CiSquarePlus } from "react-icons/ci";
import { IoWallet } from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import { AddCategoryModal } from "../components/AddCategoryModal";
import { AddCardModal } from "../components/AddCardModal";
import { EditCategoryModal } from "../components/EditCategoryModal";
import { EditCardModal } from "../components/EditCardModal";
import { CategoryList } from "../components/CategoryList";
import { CardList } from "../components/CardList";
import { fetchCategories as fetchCategoriesApi } from "../services/categoryService";
import { fetchCards as fetchCardsApi } from "../services/cardService";
import {
    calculateProfileIncome as calculateProfileIncomeApi,
    fetchProfileIncome as fetchProfileIncomeApi,
    saveProfileIncome as saveProfileIncomeApi,
} from "../services/profileService";

const MODAL_ANIMATION_MS = 300;

export function Settings() {
    const [categories, setCategories] = useState([]);
    const [cards, setCards] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);

    const [showArchivedCategories, setShowArchivedCategories] = useState(false);
    const [showArchivedCards, setShowArchivedCards] = useState(false);
    const [hasArchivedCategories, setHasArchivedCategories] = useState(false);
    const [hasArchivedCards, setHasArchivedCards] = useState(false);

    const [categoryModal, setCategoryModal] = useState(false);
    const [categoryModalClosing, setCategoryModalClosing] = useState(false);
    const categoryModalTimeoutRef = useRef(null);

    const [editCategoryModal, setEditCategoryModal] = useState(false);
    const [editCategoryModalClosing, setEditCategoryModalClosing] = useState(false);
    const editCategoryModalTimeoutRef = useRef(null);

    const [editCardModal, setEditCardModal] = useState(false);
    const [editCardModalClosing, setEditCardModalClosing] = useState(false);
    const editCardModalTimeoutRef = useRef(null);

    const [cardModal, setCardModal] = useState(false);
    const [cardModalClosing, setCardModalClosing] = useState(false);
    const cardModalTimeoutRef = useRef(null);

    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categoryError, setCategoryError] = useState("");

    const [cardLoading, setCardLoading] = useState(true);
    const [cardError, setCardError] = useState("");

    const [monthlyIncome, setMonthlyIncome] = useState("");
    const [incomeLoading, setIncomeLoading] = useState(true);
    const [incomeSaving, setIncomeSaving] = useState(false);
    const [incomeCalculating, setIncomeCalculating] = useState(false);
    const [incomeError, setIncomeError] = useState("");
    const [incomeMessage, setIncomeMessage] = useState("");

    const closeCategoryModal = useCallback(() => {
        if (!categoryModal || categoryModalClosing) {
            return;
        }

        setCategoryModalClosing(true);

        if (categoryModalTimeoutRef.current) {
            window.clearTimeout(categoryModalTimeoutRef.current);
        }

        categoryModalTimeoutRef.current = window.setTimeout(() => {
            setCategoryModal(false);
            setCategoryModalClosing(false);
            categoryModalTimeoutRef.current = null;
        }, MODAL_ANIMATION_MS);
    }, [categoryModal, categoryModalClosing]);

    const closeCardModal = useCallback(() => {
        if (!cardModal || cardModalClosing) {
            return;
        }

        setCardModalClosing(true);

        if (cardModalTimeoutRef.current) {
            window.clearTimeout(cardModalTimeoutRef.current);
        }

        cardModalTimeoutRef.current = window.setTimeout(() => {
            setCardModal(false);
            setCardModalClosing(false);
            cardModalTimeoutRef.current = null;
        }, MODAL_ANIMATION_MS);
    }, [cardModal, cardModalClosing]);

    const closeEditCategoryModal = useCallback(() => {
        if (!editCategoryModal || editCategoryModalClosing) {
            return;
        }

        setEditCategoryModalClosing(true);

        if (editCategoryModalTimeoutRef.current) {
            window.clearTimeout(editCategoryModalTimeoutRef.current);
        }

        editCategoryModalTimeoutRef.current = window.setTimeout(() => {
            setEditCategoryModal(false);
            setEditCategoryModalClosing(false);
            editCategoryModalTimeoutRef.current = null;
        }, MODAL_ANIMATION_MS);
    }, [editCategoryModal, editCategoryModalClosing]);

    const closeEditCardModal = useCallback(() => {
        if (!editCardModal || editCardModalClosing) {
            return;
        }

        setEditCardModalClosing(true);

        if (editCardModalTimeoutRef.current) {
            window.clearTimeout(editCardModalTimeoutRef.current);
        }

        editCardModalTimeoutRef.current = window.setTimeout(() => {
            setEditCardModal(false);
            setEditCardModalClosing(false);
            editCardModalTimeoutRef.current = null;
        }, MODAL_ANIMATION_MS);
    }, [editCardModal, editCardModalClosing]);

    useEffect(() => {
        return () => {
            if (categoryModalTimeoutRef.current) {
                window.clearTimeout(categoryModalTimeoutRef.current);
            }

            if (cardModalTimeoutRef.current) {
                window.clearTimeout(cardModalTimeoutRef.current);
            }
            if (editCategoryModalTimeoutRef.current) {
                window.clearTimeout(editCategoryModalTimeoutRef.current);
            }
            if (editCardModalTimeoutRef.current) {
                window.clearTimeout(editCardModalTimeoutRef.current);
            }
        };
    }, []);

    const handleCategoryModalToggle = () => {
        if (categoryModal) {
            closeCategoryModal();
            return;
        }

        if (categoryModalTimeoutRef.current) {
            window.clearTimeout(categoryModalTimeoutRef.current);
            categoryModalTimeoutRef.current = null;
        }

        setCategoryModal(true);
        setCategoryModalClosing(false);
    };

    const handleCardModalToggle = () => {
        if (cardModal) {
            closeCardModal();
            return;
        }

        if (cardModalTimeoutRef.current) {
            window.clearTimeout(cardModalTimeoutRef.current);
            cardModalTimeoutRef.current = null;
        }

        setCardModal(true);
        setCardModalClosing(false);
    };

    useEffect(() => {
        const loadCategories = async () => {
            setCategoryLoading(true);
            try {
                const [data, allCategories] = await Promise.all([
                    fetchCategoriesApi({ includeArchived: showArchivedCategories }),
                    fetchCategoriesApi({ includeArchived: true }),
                ]);

                setCategories(data || []);
                setHasArchivedCategories((allCategories || []).some((category) => category.is_archived));
                setCategoryError("");
            } catch (error) {
                setCategoryError(error.message);
            } finally {
                setCategoryLoading(false);
            }
        };

        const loadCards = async () => {
            setCardLoading(true);
            try {
                const [data, allCards] = await Promise.all([
                    fetchCardsApi({ includeArchived: showArchivedCards }),
                    fetchCardsApi({ includeArchived: true }),
                ]);

                setCards(data || []);
                setHasArchivedCards((allCards || []).some((card) => card.is_archived));
                setCardError("");
            } catch (error) {
                setCardError(error.message);
            } finally {
                setCardLoading(false);
            }
        };

        loadCategories();
        loadCards();
    }, [showArchivedCategories, showArchivedCards]);

    useEffect(() => {
        const loadIncome = async () => {
            setIncomeLoading(true);
            try {
                const income = await fetchProfileIncomeApi();
                setMonthlyIncome(Number.isFinite(Number(income)) ? String(income) : "");
                setIncomeError("");
            } catch (error) {
                setIncomeError(error.message);
            } finally {
                setIncomeLoading(false);
            }
        };

        loadIncome();
    }, []);

    useEffect(() => {
        if (!hasArchivedCategories && showArchivedCategories) {
            setShowArchivedCategories(false);
        }
    }, [hasArchivedCategories, showArchivedCategories]);

    useEffect(() => {
        if (!hasArchivedCards && showArchivedCards) {
            setShowArchivedCards(false);
        }
    }, [hasArchivedCards, showArchivedCards]);

    const handleCategoryAdded = (category) => {
        setCategories((prev) => [...prev, category]);
        closeCategoryModal();
    };

    const handleCategoryUpdated = (updatedCategory) => {
        setCategories((prev) =>
            prev.map((category) =>
                category.id === updatedCategory.id ? updatedCategory : category
            )
        );
        closeEditCategoryModal();
    };

    const handleCategoryDeleted = (deletedCategoryId) => {
        setCategories((prev) => prev.filter((category) => category.id !== deletedCategoryId));
        setSelectedCategory(null);
        closeEditCategoryModal();
    };

    const handleCardAdded = (card) => {
        setCards((prev) => [...prev, card]);
        closeCardModal();
    };

    const handleCardUpdated = (updatedCard) => {
        setCards((prev) =>
            prev.map((card) =>
                card.id === updatedCard.id ? updatedCard : card
            )
        );
        closeEditCardModal();
    };

    const handleCardDeleted = (deletedCardId) => {
        setCards((prev) => prev.filter((card) => card.id !== deletedCardId));
        setSelectedCard(null);
        closeEditCardModal();
    };

    const formattedCategoryType = (type) => {
        if (type.toLowerCase() === "expense") return "Expense";
        if (type.toLowerCase() === "income") return "Income";
        return type;
    };

    const handleSaveIncome = async () => {
        const parsedIncome = Number.parseFloat(monthlyIncome);

        if (!Number.isFinite(parsedIncome) || parsedIncome < 0) {
            setIncomeError("Monthly income must be a valid non-negative number.");
            return;
        }

        setIncomeSaving(true);
        setIncomeError("");
        setIncomeMessage("");

        try {
            const savedIncome = await saveProfileIncomeApi(parsedIncome);
            setMonthlyIncome(String(savedIncome));
            setIncomeMessage("Monthly income saved.");
        } catch (error) {
            setIncomeError(error.message);
        } finally {
            setIncomeSaving(false);
        }
    };

    const handleCalculateIncome = async () => {
        setIncomeCalculating(true);
        setIncomeError("");
        setIncomeMessage("");

        try {
            const calculatedIncome = await calculateProfileIncomeApi();
            setMonthlyIncome(String(calculatedIncome));
            setIncomeMessage("Monthly income calculated from transactions.");
        } catch (error) {
            setIncomeError(error.message);
        } finally {
            setIncomeCalculating(false);
        }
    };

    return (
        <div className="w-full h-[90dvh] flex items-center justify-start flex-col px-2 gap-4 pb-4 overflow-y-auto">
            <div className="flex flex-col bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm ">
                <div className="w-full flex items-center justify-between gap-2">
                    <h1 className="text-3xl font-berky text-green-200 text-left flex items-center gap-2">
                        <TbCategory2 />
                        Categories
                    </h1>
                    <button onClick={handleCategoryModalToggle}>
                        <CiSquarePlus size={36} color={"#bbf7d0"} />
                    </button>
                </div>
                <CategoryList
                    loading={categoryLoading}
                    errorMsg={categoryError}
                    categories={categories}
                    formattedCategoryType={formattedCategoryType}
                    onEdit={(category) => {
                        if (editCategoryModalTimeoutRef.current) {
                            window.clearTimeout(editCategoryModalTimeoutRef.current);
                            editCategoryModalTimeoutRef.current = null;
                        }

                        setSelectedCategory(category);
                        setEditCategoryModalClosing(false);
                        setEditCategoryModal(true);
                    }}
                />
                {hasArchivedCategories && (
                    <button
                        type="button"
                        className="mt-2 self-center text-sm text-green-200 underline"
                        onClick={() => setShowArchivedCategories((showArchived) => !showArchived)}
                    >
                        {showArchivedCategories ? "Hide Archived" : "Show Archived"}
                    </button>
                )}
            </div>

            <div className="flex flex-col bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm">
                <div className="w-full flex items-center justify-between gap-2">
                    <h1 className="text-3xl font-berky text-green-200 text-left flex items-center gap-2">
                        <IoWallet />
                        Cards
                    </h1>
                    <button onClick={handleCardModalToggle}>
                        <CiSquarePlus size={36} color={"#bbf7d0"} />
                    </button>
                </div>
                <CardList
                    loading={cardLoading}
                    errorMsg={cardError}
                    cards={cards}
                    onEdit={(card) => {
                        if (editCardModalTimeoutRef.current) {
                            window.clearTimeout(editCardModalTimeoutRef.current);
                            editCardModalTimeoutRef.current = null;
                        }

                        setSelectedCard(card);
                        setEditCardModalClosing(false);
                        setEditCardModal(true);
                    }}
                />
                {hasArchivedCards && (
                    <button
                        type="button"
                        className="mt-2 self-center text-sm text-green-200 underline"
                        onClick={() => setShowArchivedCards((showArchived) => !showArchived)}
                    >
                        {showArchivedCards ? "Hide Archived" : "Show Archived"}
                    </button>
                )}
            </div>

            <div className="flex flex-col bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm gap-2">
                <div className="w-full flex items-center justify-between gap-2">
                    <h1 className="text-3xl font-berky text-green-200 text-left flex items-center gap-2">
                        <FaMoneyBillWave />
                        Income
                    </h1>
                    <button
                        type="button"
                        className="bg-green-100 text-slate-700 font-semibold px-4 py-2 rounded-xl disabled:opacity-60"
                        onClick={handleCalculateIncome}
                        disabled={incomeLoading || incomeSaving || incomeCalculating}
                    >
                        {incomeCalculating ? "Calculating..." : "Calculate"}
                    </button>
                </div>

                <p className="text-sm text-green-100/90">
                    Average monthly income used for weekly income estimate on your dashboard.
                </p>

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={monthlyIncome}
                        onChange={(event) => setMonthlyIncome(event.target.value)}
                        disabled={incomeLoading || incomeSaving || incomeCalculating}
                        className="flex-1 bg-green-100 rounded-xl px-4 py-2 text-right shadow-sm"
                        placeholder="0.00"
                    />
                    <button
                        type="button"
                        className="bg-[#4aba68] text-green-100 font-bold px-4 py-2 rounded-xl disabled:opacity-60"
                        onClick={handleSaveIncome}
                        disabled={incomeLoading || incomeSaving || incomeCalculating}
                    >
                        {incomeSaving ? "Saving..." : "Save"}
                    </button>
                </div>

                {incomeLoading && <p className="text-sm text-green-100/90">Loading income...</p>}
                {incomeError && <p className="text-sm text-rose-300">{incomeError}</p>}
                {incomeMessage && <p className="text-sm text-green-200">{incomeMessage}</p>}
            </div>

            {categoryModal && (
                <AddCategoryModal
                    isClosing={categoryModalClosing}
                    onClose={closeCategoryModal}
                    onCategoryAdded={handleCategoryAdded}
                />
            )}

            {editCategoryModal && (
                <EditCategoryModal
                    isClosing={editCategoryModalClosing}
                    onClose={closeEditCategoryModal}
                    onCategoryUpdated={handleCategoryUpdated}
                    onCategoryDeleted={handleCategoryDeleted}
                    selectedCategory={selectedCategory}
                />
            )}

            {cardModal && (
                <AddCardModal
                    isClosing={cardModalClosing}
                    onClose={closeCardModal}
                    onCardAdded={handleCardAdded}
                />
            )}

            {editCardModal && (
                <EditCardModal
                    isClosing={editCardModalClosing}
                    onClose={closeEditCardModal}
                    onCardUpdated={handleCardUpdated}
                    onCardDeleted={handleCardDeleted}
                    selectedCard={selectedCard}
                />
            )}
        </div>
    );
}
