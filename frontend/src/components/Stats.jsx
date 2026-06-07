import React, {useState, useEffect, useRef} from "react";
import { FaChevronDown } from "react-icons/fa6";
import { supabase } from "../config/supabaseClient";
import FrogHead from '../assets/FrogHead.svg';
import { fetchCategories as fetchCategoriesApi } from "../services/categoryService";
import { fetchCards as fetchCardsApi } from "../services/cardService";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const STATUS_MESSAGE_TIMEOUT_MS = 3000;

export function Stats() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    const stats = [
        {Label: "Spent", Value: "$123.45"},
        {Label: "Remaining", Value: "$376.55"},
        {Label: "Budget", Value: "$500.00"},

    ]
    const types = [
        "Expense",
        "Income"
    ]

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [categories, setCategories] = useState([]);
    const [category, setSelectedCategory] = useState(null);
    const [cards, setCards] = useState([]);
    const [card, setSelectedCard] = useState(null);
    const [type, setSelectedType] = useState(0);
    const [date, setDate] = useState(getTodayDate);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const categoryDropdownRef = useRef(null);

    const [cardModalOpen, setCardModalOpen] = useState(false);
    const cardDropdownRef = useRef(null);

    const [typeModalOpen, setTypeModalOpen] = useState(false);
    const typeDropdownRef = useRef(null);
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setCategoryModalOpen(false);
            }

            if (cardDropdownRef.current && !cardDropdownRef.current.contains(event.target)) {
                setCardModalOpen(false);
            }

            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
                setTypeModalOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategoriesApi();
                const nextCategories = data || [];
                setCategories(nextCategories);

                if (nextCategories.length > 0) {
                    setSelectedCategory((current) => current ?? nextCategories[0].id);
                }
            } catch (error) {
                setCategoriesError(error.message);
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const loadCards = async () => {
            try {
                const data = await fetchCardsApi();
                const nextCards = data || [];
                setCards(nextCards);

                if (nextCards.length > 0) {
                    setSelectedCard((current) => current ?? nextCards[0].id);
                }
            } catch (error) {
                setCardsError(error.message);
            } finally {
                setCardsLoading(false);
            }
        };

        loadCards();
    }, []);

    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");
    const [cardsLoading, setCardsLoading] = useState(true);
    const [cardsError, setCardsError] = useState("");
    const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

    useEffect(() => {
        if (!statusMessage.message) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setStatusMessage({ type: "", message: "" });
        }, STATUS_MESSAGE_TIMEOUT_MS);

        return () => window.clearTimeout(timeoutId);
    }, [statusMessage.message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: '', message: '' });

        if (!category) {
            setStatusMessage({ type: 'error', message: 'Please select a category.' });
            setLoading(false);
            return;
        }

        if (!card) {
            setStatusMessage({ type: 'error', message: 'Please select a card.' });
            setLoading(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Not logged in!');
            }
            const token = session.access_token;

            const response = await fetch(`${apiBaseUrl}/api/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description,
                    amount: parseFloat(amount),
                    date,
                    card_id: card,
                    category_id: category
                })
            });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit transaction.');
        }

        setStatusMessage({ type: 'success', message: 'Transaction logged!' });
        setDescription('');
        setAmount('');
        setDate(getTodayDate());
        
        } catch (error) {
        setStatusMessage({ type: 'error', message: error.message });
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full items-center justify-start gap-2">
            <h1 className="text-lg self-start w-full font-semibold text-green-200 -mb-1">This Week</h1>
            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div key={stat.Label} className="bg-green-100 rounded-3xl px-4 py-2 flex flex-col items-center justify-between gap-1 aspect-2/1 w-full shadow-sm">
                        <p className="text-2xl font-bold text-slate-700">{stat.Value}</p>
                        <p className="text-md text-slate-600">{stat.Label}</p>
                    </div>
                ))}
            </div>
            <form className="flex flex-col items-center justify-center gap-1 w-full" onSubmit={handleSubmit}>
                <div className="grid grid-cols-8 grid-rows-3 gap-x-3 gap-y-1 w-full">
                    {/* Description */}
                    <div className="flex flex-col items-center justify-center w-full col-span-5">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Description</h1>
                        <input type="text" className="bg-green-100 rounded-xl px-4 py-2 w-full shadow-sm" placeholder="Frog food, rent, etc." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col items-center justify-center w-full col-span-3">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Amount</h1>
                        <input type="number" className="bg-green-100 rounded-xl px-4 py-2 w-full text-right shadow-sm" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>

                    {/* Category */}
                    <div ref={categoryDropdownRef} className="relative flex flex-col items-center justify-center w-full col-span-4 shadow-sm">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Category</h1>
                        <button type="button" className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center justify-between" onClick={() => setCategoryModalOpen((open) => !open)} disabled={categoriesLoading || categories.length === 0}>
                            {categoriesLoading ? "Loading categories..." : categoriesError ? "Categories unavailable" : (categories.find((currentCategory) => currentCategory.id === category)?.name || "Select Category")}
                            <FaChevronDown className={`ml-2 ${categoryModalOpen ? "transform rotate-180" : ""}`} />
                        </button>
                        {categoryModalOpen && !categoriesLoading && !categoriesError && (
                            <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg py-1 mt-2 w-full z-20">
                                {categories.map((categoryItem) => (
                                    <div key={categoryItem.id} className="px-4 py-2 rounded cursor-pointer" onClick={() => {setSelectedCategory(categoryItem.id); setCategoryModalOpen(false)}}>
                                        {categoryItem.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        {categoriesError && <div className="text-xs text-rose-300 mt-1 w-full">{categoriesError}</div>}
                    </div>

                    {/* Card */}
                    <div ref={cardDropdownRef} className="relative flex flex-col items-center justify-center w-full col-span-4 shadow-sm">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Card</h1>
                        <button type="button" className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center justify-between" onClick={() => setCardModalOpen((open) => !open)} disabled={cardsLoading || cards.length === 0}>
                            {cardsLoading ? "Loading cards..." : cardsError ? "Cards unavailable" : (cards.find((currentCard) => currentCard.id === card)?.name || "Select Card")}
                            <FaChevronDown className={`ml-2 ${cardModalOpen ? "transform rotate-180" : ""}`} />
                        </button>
                        {cardModalOpen && !cardsLoading && !cardsError && (
                            <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg py-1 mt-2 flex flex-col z-20">
                                {cards.map((cardItem) => (
                                    <div key={cardItem.id} className="px-4 py-2 rounded cursor-pointer" onClick={() => {setSelectedCard(cardItem.id); setCardModalOpen(false)}}>
                                        {cardItem.name}{cardItem.last_four ? ` •••• ${cardItem.last_four}` : ''}
                                    </div>
                                ))}
                            </div>
                        )}
                        {cardsError && <div className="text-xs text-rose-300 mt-1 w-full">{cardsError}</div>}
                    </div>

                    {/* Date */}
                    <div className="flex flex-col items-center justify-center w-full col-span-4">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Date</h1>
                        <input type="date" className="bg-green-100 rounded-xl px-4 py-2 w-full text-right shadow-sm" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>

                    {/* Submit */}
                    <button type="submit" className="bg-[#4aba68] text-green-100 font-semibold px-4 rounded-xl shadow-md h-10 font-berky text-3xl flex items-center justify-center -rotate-3 mt-4 col-span-4 self-end" disabled={loading}>
                        {loading? <img src={FrogHead} alt="Loading..." className="w-6 h-6 animate-spin" /> : "Submit"} 
                    </button>
                </div>
                
                {statusMessage.message && (
                    <div className={`text-xs font-semibold mt-4 rounded-xl ${
                    statusMessage.type === 'success' ? 'text-green-300' : ' text-rose-500'
                    }`}>
                    {statusMessage.message}
                    </div>
                )}

            </form>


        </div>
    )
}