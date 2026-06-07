import React, { useCallback, useEffect, useRef, useState } from "react";
import { TbCategory2 } from "react-icons/tb";
import { CiSquarePlus } from "react-icons/ci";
import { IoWallet } from "react-icons/io5";
import { AddCategoryModal } from "../components/AddCategoryModal";
import { AddCardModal } from "../components/AddCardModal";
import { CategoryList } from "../components/CategoryList";
import { CardList } from "../components/CardList";
import { fetchCategories as fetchCategoriesApi } from "../services/categoryService";
import { fetchCards as fetchCardsApi } from "../services/cardService";

const MODAL_ANIMATION_MS = 300;

export function Settings() {
    const [categories, setCategories] = useState([]);
    const [cards, setCards] = useState([]);

    const [categoryModal, setCategoryModal] = useState(false);
    const [categoryModalClosing, setCategoryModalClosing] = useState(false);
    const categoryModalTimeoutRef = useRef(null);

    const [cardModal, setCardModal] = useState(false);
    const [cardModalClosing, setCardModalClosing] = useState(false);
    const cardModalTimeoutRef = useRef(null);

    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categoryError, setCategoryError] = useState("");

    const [cardLoading, setCardLoading] = useState(true);
    const [cardError, setCardError] = useState("");

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

    useEffect(() => {
        return () => {
            if (categoryModalTimeoutRef.current) {
                window.clearTimeout(categoryModalTimeoutRef.current);
            }

            if (cardModalTimeoutRef.current) {
                window.clearTimeout(cardModalTimeoutRef.current);
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
            try {
                const data = await fetchCategoriesApi();
                setCategories(data || []);
            } catch (error) {
                setCategoryError(error.message);
            } finally {
                setCategoryLoading(false);
            }
        };

        const loadCards = async () => {
            try {
                const data = await fetchCardsApi();
                setCards(data || []);
            } catch (error) {
                setCardError(error.message);
            } finally {
                setCardLoading(false);
            }
        };

        loadCategories();
        loadCards();
    }, []);

    const handleCategoryAdded = (category) => {
        setCategories((prev) => [...prev, category]);
        closeCategoryModal();
    };

    const handleCardAdded = (card) => {
        setCards((prev) => [...prev, card]);
        closeCardModal();
    };

    const formattedCategoryType = (type) => {
        if (type.toLowerCase() === "expense") return "Expense";
        if (type.toLowerCase() === "income") return "Income";
        return type;
    };

    return (
        <div className="w-full h-screen flex items-center justify-start flex-col px-2 gap-4 overflow-y-auto pb-4">
            <div className="flex flex-col bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm">
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
                />
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
                <CardList loading={cardLoading} errorMsg={cardError} cards={cards} />
            </div>

            {categoryModal && (
                <AddCategoryModal
                    isClosing={categoryModalClosing}
                    onClose={closeCategoryModal}
                    onCategoryAdded={handleCategoryAdded}
                />
            )}

            {cardModal && (
                <AddCardModal isClosing={cardModalClosing} onClose={closeCardModal} onCardAdded={handleCardAdded} />
            )}
        </div>
    );
}
