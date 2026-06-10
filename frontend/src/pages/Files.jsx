import React, { useState, useEffect, useRef, useCallback } from "react";
import { uploadAndParseCSV, createBulkTransactions } from "../services/transactionService";
import { fetchCategories } from "../services/categoryService";
import { fetchCards } from "../services/cardService";
import FrogHead from "../assets/FrogHead.svg";
import { FaChevronDown } from "react-icons/fa6";
import { IoArrowRedoSharp, IoArrowUndoSharp } from "react-icons/io5";
import { AddCategoryModal } from "../components/AddCategoryModal";
import { AddCardModal } from "../components/AddCardModal";
import { getCategoryIconByName } from "../assets/categoryIcons";
import { userColorChoices } from "../assets/userColorChoices";

export function Files() {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rawRows, setRawRows] = useState([]);
    const [availableHeaders, setAvailableHeaders] = useState([]);
    
    // App Data States
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categoryError, setCategoryError] = useState('');
    const [cards, setCards] = useState([]);
    const [cardLoading, setCardLoading] = useState(true);
    const [cardError, setCardError] = useState('');
    const [selectedCard, setSelectedCard] = useState('');
    const [cardModalOpen, setCardModalOpen] = useState(false);
    
    // Mapping Config States
    const [step, setStep] = useState(1); // 1: Upload, 2: Map Headers, 3: Row Sorter
    const [mappings, setMappings] = useState({
        dateKey: '',
        descKey: '',
        amountKey: ''
    });
    const [reviewRows, setReviewRows] = useState([]);
    const [activeRowIndex, setActiveRowIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState('');
    const [isSwiping, setIsSwiping] = useState(false);
    const swipeTimeoutRef = useRef(null);

    // Modal Visibility Toggles
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setErrorMsg('');
    };

    const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setErrorMsg('Please select a file first.');
    
    setLoading(true);
    setErrorMsg('');

    try {
        const result = await uploadAndParseCSV(file);
        
        if (result.transactions && result.transactions.length > 0) {
        setRawRows(result.transactions);
        setAvailableHeaders(Object.keys(result.transactions[0]));
        setStep(2);
        }
    } catch (err) {
        setErrorMsg(err.message || 'Error processing statement.');
    } finally {
        setLoading(false);
    }
    };

    const handleBulkSubmit = async () => {
    if (!selectedCard) return alert("Please map the active payment card account!");

    const categorizedRows = reviewRows.filter((row) => !!row.assigned_category_id);
    if (categorizedRows.length === 0) {
        return alert("No categorized rows to submit yet. Assign at least one category first.");
    }

    setLoading(true);
    try {
        const formattedPayload = categorizedRows.map(row => ({
        description: row[mappings.descKey],
        amount: row[mappings.amountKey],
        date: row[mappings.dateKey],
        card_id: selectedCard,
        category_id: row.assigned_category_id
        }));

        const result = await createBulkTransactions(formattedPayload);
        
        alert(`Logged ${result.count} transactions cleanly!`);
        
        setRawRows([]);
        setReviewRows([]);
        setActiveRowIndex(0);
        setStep(1);
        
    } catch (err) {
        alert(`Bulk processing failed: ${err.message}`);
    } finally {
        setLoading(false);
    }
    };

    const loadCategories = useCallback(async () => {
        try {
            const data = await fetchCategories();
            setCategories(data || []);
        } catch (error) {
            setCategoryError(error.message);
        } finally {
            setCategoryLoading(false);
        }
    }, []);

    const loadCards = useCallback(async () => {
        try {
            const data = await fetchCards();
            setCards(data || []);
        } catch (error) {
            setCardError(error.message);
        } finally {
            setCardLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
        loadCards();
    }, [loadCategories, loadCards]);

    useEffect(() => {
        return () => {
            if (swipeTimeoutRef.current) {
                clearTimeout(swipeTimeoutRef.current);
            }
        };
    }, []);

    const startRowReview = () => {
        const initializedRows = rawRows.map((row) => ({
            ...row,
            assigned_category_id: row.assigned_category_id || null,
        }));
        setReviewRows(initializedRows);
        setActiveRowIndex(0);
        setStep(3);
    };

    const handleConfirmColumnsAndCard = () => {
        if (!mappings.dateKey || !mappings.descKey || !mappings.amountKey) {
            alert("Please map all required CSV columns first.");
            return;
        }

        if (!selectedCard) {
            alert("Please select the target card before continuing.");
            return;
        }

        startRowReview();
    };

    const animateSwipe = (direction, onFinish) => {
        if (isSwiping) return;
        setSwipeDirection(direction);
        setIsSwiping(true);

        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }

        swipeTimeoutRef.current = setTimeout(() => {
            onFinish();
            setSwipeDirection('');
            setIsSwiping(false);
        }, 260);
    };

    const handleCategoryAssign = (categoryId) => {
        if (!reviewRows[activeRowIndex] || isSwiping) return;

        setReviewRows((previousRows) => previousRows.map((row, index) => (
            index === activeRowIndex
                ? { ...row, assigned_category_id: categoryId }
                : row
        )));

        animateSwipe('left', () => {
            setActiveRowIndex((previous) => Math.min(previous + 1, reviewRows.length));
        });
    };

    const handleNext = () => {
        if (!reviewRows[activeRowIndex] || isSwiping) return;

        setReviewRows((previousRows) => previousRows.map((row, index) => (
            index === activeRowIndex
                ? { ...row, assigned_category_id: null }
                : row
        )));

        animateSwipe('left', () => {
            setActiveRowIndex((previous) => Math.min(previous + 1, reviewRows.length));
        });
    };

    const handlePrevious = () => {
        if (activeRowIndex === 0 || isSwiping) return;

        animateSwipe('right', () => {
            setActiveRowIndex((previous) => Math.max(previous - 1, 0));
        });
    };

    const isReviewComplete = reviewRows.length > 0 && activeRowIndex >= reviewRows.length;
    const currentRow = isReviewComplete ? null : reviewRows[activeRowIndex];
    const assignedCount = reviewRows.filter((row) => !!row.assigned_category_id).length;

    const getCategoryColor = (category) => {
        if (typeof category.color === "number") {
            return userColorChoices[category.color] || "#4aba68";
        }

        if (typeof category.color === "string" && /^\d+$/.test(category.color)) {
            return userColorChoices[Number(category.color)] || "#4aba68";
        }

        return category.color || "#4aba68";
    };

    return (
        <div className="w-full p-2 space-y-4">
        
        {step === 1 && (
            <div className="flex flex-col bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm">
                <h2 className="text-3xl text-green-200 font-berky mb-4 text-center">Upload Statement</h2>
                {errorMsg && <div className="p-3 mb-3 text-xs bg-rose-500/20 border border-rose-500 text-rose-200 rounded-xl">{errorMsg}</div>}
                <form onSubmit={handleUploadSubmit} className="space-y-4 w-full flex flex-col">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="w-full text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-[#4aba68]" />
                    <button type="submit" disabled={loading || !file} className="w-[65%] bg-[#4aba68] text-green-100 px-4 rounded-xl shadow-md h-10 font-berky text-3xl flex items-center justify-center self-center -rotate-3 floatAnimationSmall">{loading ? 'Loading...' : 'Parse File'}<img src={FrogHead} alt="Frog Head" className="w-8 h-8 ml-2" /></button>
                </form>
            </div>
        )}

        {step === 2 && (
            <div className="bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm gap-2 flex flex-col">
                <div className="w-full grid grid-cols-2 gap-2 grid-rows-2">
                    <h1 className="text-green-200 font-berky text-3xl text-center col-span-2 ">Target Card</h1>
                    <div className="relative flex-1 w-full flex items-center">
                        <button type="button" className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center gap-2 shadow-md outline-none" onClick={() => setCardModalOpen((open) => !open)} disabled={cardLoading || cards.length === 0}>
                            <span className="min-w-0 flex-1 truncate" title={cards.find((currentCard) => currentCard.id === selectedCard)?.name || "Select Card"}>
                                {cards.find((currentCard) => currentCard.id === selectedCard)?.name || "Select Card"}
                            </span>
                            <FaChevronDown className={`ml-2 shrink-0 ${cardModalOpen ? "transform rotate-180" : ""}`} />
                        </button>
                        {cardModalOpen && !cardLoading && !cardError && (
                            <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg py-1 mt-2 flex flex-col z-20 w-full">
                                {cards.map((cardItem) => (
                                    <div key={cardItem.id} className="px-4 py-2 rounded cursor-pointer truncate whitespace-nowrap" title={`${cardItem.name}${cardItem.last_four ? ` •••• ${cardItem.last_four}` : ''}`} onClick={() => {setSelectedCard(cardItem.id); setCardModalOpen(false)}}>
                                        {cardItem.name}{cardItem.last_four ? ` •••• ${cardItem.last_four}` : ''}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setShowCardModal(true)} className="px-2 py-1 bg-[#4aba68] rounded-xl text-lg font-bold text-green-100 shadow-md">
                        Add Card
                    </button>
                </div>
                
                <div>
                <h2 className="text-3xl text-green-200 text-center font-berky mt-4 mb-2">Map CSV Headers</h2>
                    <label className="block text-lg font-semibold text-green-200 mb-1">Transaction Date Column</label>
                    <select value={mappings.dateKey} onChange={(e) => setMappings({...mappings, dateKey: e.target.value})} className="w-full px-4 py-3 bg-green-100 text-slate-600 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">-- Choose matching column --</option>
                        {availableHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    </div>
                    <div>
                    <label className="block text-lg font-semibold text-green-200 mb-1">Description / Merchant Column</label>
                    <select value={mappings.descKey} onChange={(e) => setMappings({...mappings, descKey: e.target.value})} className="w-full px-4 py-3 bg-green-100 text-slate-600 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">-- Choose matching column --</option>
                        {availableHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    </div>
                    <div>
                    <label className="block text-lg font-semibold text-green-200 mb-1">Transaction Amount Column</label>
                    <select value={mappings.amountKey} onChange={(e) => setMappings({...mappings, amountKey: e.target.value})} className="w-full px-4 py-3 bg-green-100 text-slate-600 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">-- Choose matching column --</option>
                        {availableHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>



                <button 
                    onClick={handleConfirmColumnsAndCard}
                    className="w-[85%] bg-[#4aba68] text-green-100 px-4 py-1 mt-4 rounded-xl shadow-md font-berky text-3xl flex items-center justify-center self-center -rotate-3 floatAnimationSmall"
                >
                    Confirm All
                </button>
            </div>
        )}

        {step === 3 && (
            <div className="space-y-4">
            <div className="space-y-3">

                {!isReviewComplete && currentRow && (
                    <>
                        <div className="bg-green-100 p-4 rounded-3xl shadow-md min-h-[160px] flex flex-col justify-between"
                            style={{
                                transform: swipeDirection === 'left'
                                    ? 'translateX(-120%) rotate(-8deg)'
                                    : swipeDirection === 'right'
                                        ? 'translateX(120%) rotate(8deg)'
                                        : 'translateX(0)',
                                opacity: swipeDirection ? 0 : 1,
                                transition: 'transform 260ms ease, opacity 260ms ease',
                            }}
                        >
                            <p className="text-[11px] text-slate-600 font-bold">
                                {activeRowIndex + 1} of {reviewRows.length}
                            </p>
                            <div>
                                <p className="font-bold text-slate-800 text-base">{currentRow[mappings.descKey] || 'Unknown Merchant'}</p>
                                <p className="text-[12px] text-slate-600 font-bold mt-1">
                                    {currentRow[mappings.dateKey]} • Value: <span className="text-slate-600">${currentRow[mappings.amountKey]}</span>
                                </p>
                            </div>
                            <p className="text-[11px] font-bold text-slate-600 mt-2">Tap a category to assign and move next.</p>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {categories.map((category) => {
                                const categoryColor = getCategoryColor(category);
                                const isAssigned = currentRow.assigned_category_id === category.id;

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        disabled={isSwiping}
                                        onClick={() => handleCategoryAssign(category.id)}
                                        className={`rounded-2xl p-2 aspect-square flex flex-col items-center justify-center shadow-md transition-all ${isAssigned ? 'ring-2 ring-white/90 scale-[0.97]' : 'hover:-translate-y-0.5'}`}
                                        style={{ backgroundColor: categoryColor }}
                                        title={category.name}
                                    >
                                        {getCategoryIconByName(category.icon, '#ffffff', 20)}
                                        <span className="text-[10px] mt-1 text-white font-bold leading-tight text-center line-clamp-2">{category.name}</span>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(true)}
                                className="rounded-2xl p-2 aspect-square flex flex-col items-center justify-center shadow-md bg-emerald-500 text-white font-black text-xs"
                            >
                                <span className="text-lg leading-none">+</span>
                                <span>Create</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={activeRowIndex === 0 || isSwiping}
                                className="py-3 rounded-2xl bg-green-100 text-slate-700 font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                <IoArrowUndoSharp size={18} />
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isSwiping}
                                className="py-3 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                Skip
                                <IoArrowRedoSharp size={18} />
                            </button>
                        </div>
                    </>
                )}

                {isReviewComplete && (
                    <div className="bg-green-100 p-4 rounded-3xl shadow-md">
                        <h4 className="text-slate-600 font-bold text-lg">Review Complete</h4>
                        <p className="text-slate-500 text-sm mt-1">
                            Categorized {assignedCount} of {reviewRows.length} rows. Only categorized rows will be submitted.
                        </p>
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="mt-3 py-2 px-4 rounded-xl bg-green-200 text-slate-600 font-bold flex items-center justify-center gap-2"
                        >
                            <IoArrowUndoSharp size={18} />
                            Go Back
                        </button>
                    </div>
                )}
            </div>

            <button onClick={handleBulkSubmit} className="w-full py-4 bg-emerald-500 text-green-100 rounded-2xl tracking-wider text-xl font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50" disabled={loading || reviewRows.filter((row) => !!row.assigned_category_id).length === 0}>
                Save Transactions ({assignedCount}) <img src={FrogHead} alt="Frog Head" className="w-7 h-7 ml-2" />
            </button>
            </div>
        )}

        {showCategoryModal && (
            <AddCategoryModal 
                onClose={() => { setShowCategoryModal(false); }} 
                onCategoryAdded={(newCategory) => {
                    setShowCategoryModal(false);
                    setCategories((previousCategories) => [...previousCategories, newCategory]);
                }} 
            />
        )}

        {showCardModal && (
            <AddCardModal 
                onClose={() => { setShowCardModal(false); }} 
                onSuccess={() => {
                    setShowCardModal(false);
                    loadCards();
                }} 
            />
        )}

        </div>
    );
}