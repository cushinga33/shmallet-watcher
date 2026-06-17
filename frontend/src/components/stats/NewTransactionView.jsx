import React from "react";
import { FaChevronDown } from "react-icons/fa6";
import FrogHead from "../../assets/FrogHead.svg";

export function NewTransactionView({
    description,
    setDescription,
    amount,
    setAmount,
    categories,
    categoriesLoading,
    categoriesError,
    category,
    setSelectedCategory,
    categoryModalOpen,
    setCategoryModalOpen,
    categoryDropdownRef,
    cards,
    cardsLoading,
    cardsError,
    card,
    setSelectedCard,
    cardModalOpen,
    setCardModalOpen,
    cardDropdownRef,
    date,
    setDate,
    timeframe,
    setTimeframe,
    timeframeModalOpen,
    setTimeframeModalOpen,
    timeframeDropdownRef,
    timeframes,
    loading,
    onSubmit,
    statusMessage,
}) {
    return (
        <div className="w-full h-full">
            <h1 className="text-3xl self-center text-center w-full font-berky text-green-200 mb-2">New Transaction</h1>

            <form className="flex flex-col items-center justify-center gap-1 w-full" onSubmit={onSubmit}>
                <div className="grid grid-cols-8 grid-rows-3 gap-x-3 gap-y-1 w-full">
                    <div className="flex flex-col items-center justify-center w-full col-span-5">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Description</h1>
                        <input type="text" className="bg-green-100 rounded-xl px-4 py-2 w-full shadow-sm" placeholder="Frog food, rent, etc." value={description} onChange={(event) => setDescription(event.target.value)} />
                    </div>

                    <div className="flex flex-col items-center justify-center w-full col-span-3">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Amount</h1>
                        <input type="number" className="bg-green-100 rounded-xl px-4 py-2 w-full text-right shadow-sm" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} />
                    </div>

                    <div ref={categoryDropdownRef} className="relative z-30 flex flex-col items-center justify-center w-full col-span-4">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Category</h1>
                        <button type="button" className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center gap-2" onClick={() => setCategoryModalOpen((open) => !open)} disabled={categoriesLoading || categories.length === 0}>
                            <span className="min-w-0 flex-1 truncate" title={categoriesLoading ? "Loading categories..." : categoriesError ? "Categories unavailable" : (categories.find((currentCategory) => currentCategory.id === category)?.name || "Select Category")}>
                                {categoriesLoading ? "Loading categories..." : categoriesError ? "Categories unavailable" : (categories.find((currentCategory) => currentCategory.id === category)?.name || "Select Category")}
                            </span>
                            <FaChevronDown className={`ml-2 shrink-0 ${categoryModalOpen ? "transform rotate-180" : ""}`} />
                        </button>
                        {categoryModalOpen && !categoriesLoading && !categoriesError && (
                            <div className="absolute top-full left-0 z-40 bg-green-100 rounded-xl shadow-lg py-1 mt-2 w-full max-h-[50dvh] overflow-y-auto">
                                {categories.map((categoryItem) => (
                                    <div key={categoryItem.id} className="px-4 py-2.5 rounded cursor-pointer truncate whitespace-nowrap" title={categoryItem.name} onClick={() => { setSelectedCategory(categoryItem.id); setCategoryModalOpen(false); }}>
                                        {categoryItem.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div ref={cardDropdownRef} className="relative flex flex-col items-center justify-center w-full col-span-4">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Card</h1>
                        <button type="button" className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center gap-2" onClick={() => setCardModalOpen((open) => !open)} disabled={cardsLoading || cards.length === 0}>
                            <span className="min-w-0 flex-1 truncate" title={cards.find((currentCard) => currentCard.id === card)?.name || "Select Card"}>
                                {cards.find((currentCard) => currentCard.id === card)?.name || "Select Card"}
                            </span>
                            <FaChevronDown className={`ml-2 shrink-0 ${cardModalOpen ? "transform rotate-180" : ""}`} />
                        </button>
                        {cardModalOpen && !cardsLoading && !cardsError && (
                            <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg py-1 mt-2 flex flex-col z-20 w-full">
                                {cards.map((cardItem) => (
                                    <div key={cardItem.id} className="px-4 py-2 rounded cursor-pointer truncate whitespace-nowrap" title={`${cardItem.name}${cardItem.last_four ? ` •••• ${cardItem.last_four}` : ""}`} onClick={() => { setSelectedCard(cardItem.id); setCardModalOpen(false); }}>
                                        {cardItem.name}{cardItem.last_four ? ` •••• ${cardItem.last_four}` : ""}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center w-full col-span-4 min-w-0">
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Date</h1>
                        <input type="date" className="bg-green-100 rounded-xl px-4 py-2 w-full text-right shadow-sm" value={date} onChange={(event) => setDate(event.target.value)} />
                    </div>

                    <div className="flex flex-col items-center justify-center w-full col-span-4 relative" ref={timeframeDropdownRef}>
                        <h1 className="text-lg self-start w-full font-semibold text-green-200">Reccurring</h1>
                        <button
                            type="button"
                            className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full h-full flex items-center justify-between"
                            onClick={() => setTimeframeModalOpen((open) => !open)}
                        >
                            {timeframes[timeframe]}
                            <FaChevronDown className={`ml-2 ${timeframeModalOpen ? "transform rotate-180" : ""}`} />
                        </button>
                        {timeframeModalOpen && (
                            <div className="absolute top-full left-0 bg-green-100 rounded-xl shadow-lg p-2 mt-2 flex flex-col gap-2 z-20 w-full">
                                {timeframes.map((timeframeOption, index) => (
                                    <div
                                        key={timeframeOption}
                                        className="p-2 rounded cursor-pointer items-center flex"
                                        onClick={() => {
                                            setTimeframe(index);
                                            setTimeframeModalOpen(false);
                                        }}
                                    >
                                        {timeframeOption}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="bg-[#4aba68] text-green-100 font-semibold px-4 rounded-xl shadow-md h-10 font-berky text-3xl flex items-center justify-center -rotate-3 mt-4 col-start-3 col-end-7" disabled={loading}>
                        {loading ? <img src={FrogHead} alt="Loading..." className="w-6 h-6 animate-spin" /> : "Submit"}
                    </button>
                </div>

                {statusMessage.message && (
                    <div className={`text-xs font-semibold mt-4 rounded-xl ${statusMessage.type === "success" ? "text-green-300" : " text-rose-500"}`}>
                        {statusMessage.message}
                    </div>
                )}
            </form>
        </div>
    );
}
