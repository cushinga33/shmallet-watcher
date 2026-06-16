import React, { useState } from "react";
import FrogHead from "../assets/FrogHead.svg";
import { FaChevronDown } from "react-icons/fa6";
import { AiOutlineDelete } from "react-icons/ai";
import { deleteTransaction, updateTransaction } from "../services/transactionService";

const timeframes = ["Once", "Monthly", "Bi-Weekly", "Weekly", "Daily"];

function resolveTimeframeIndex(value) {
  if (typeof value === "number" && value >= 0 && value < timeframes.length) {
    return value;
  }

  if (typeof value === "string") {
    const index = timeframes.findIndex((timeframe) => timeframe.toLowerCase() === value.toLowerCase());
    if (index !== -1) {
      return index;
    }
  }

  return 0;
}

export function EditTransactionModal({
  isClosing,
  onClose,
  onTransactionUpdated,
  onTransactionDeleted,
  selectedTransaction,
  categories,
  cards,
}) {
  const [description, setDescription] = useState(selectedTransaction?.description || "");
  const [amount, setAmount] = useState(selectedTransaction?.amount ?? "");
  const [date, setDate] = useState(selectedTransaction?.date || "");
  const [categoryId, setCategoryId] = useState(selectedTransaction?.category_id || "");
  const [cardId, setCardId] = useState(selectedTransaction?.card_id || "");
  const [timeframe, setTimeframe] = useState(resolveTimeframeIndex(selectedTransaction?.timeframe));

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [timeframeModalOpen, setTimeframeModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdateTransaction = async (event) => {
    event.preventDefault();

    if (!description.trim()) {
      setErrorMsg("Description is required.");
      return;
    }

    if (!amount) {
      setErrorMsg("Amount is required.");
      return;
    }

    if (!date) {
      setErrorMsg("Date is required.");
      return;
    }

    if (!categoryId) {
      setErrorMsg("Category is required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const transaction = await updateTransaction({
        id: selectedTransaction?.id,
        description: description.trim(),
        amount: parseFloat(amount),
        date,
        card_id: cardId || null,
        category_id: categoryId,
        timeframe: timeframes[timeframe],
      });

      onTransactionUpdated(transaction);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction?.id) {
      setErrorMsg("Transaction id is missing.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await deleteTransaction(selectedTransaction.id);
      onTransactionDeleted(selectedTransaction.id);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 w-full h-screen flex top-0 items-end ${!isClosing ? "backdrop-blur-sm backdrop-brightness-75" : ""} transition-all duration-300`}
      onClick={onClose}
    >
      <div
        className={`bg-linear-to-br from-green-100/30 to-green-200/10 p-3 border-green-100/15 border-1 backdrop-blur-sm shadow-sm w-full h-[85%] rounded-t-3xl flex flex-col gap-2 ${isClosing ? "slideOutDownAnimation" : "slideInUpAnimation"}`}
        onClick={(event) => {
          event.stopPropagation();

          if (event.target === event.currentTarget) {
            setCategoryModalOpen(false);
            setCardModalOpen(false);
            setTimeframeModalOpen(false);
          }
        }}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <h1 className="text-3xl font-berky text-green-200 text-left flex items-center gap-2">
            Edit Transaction
          </h1>
          <button
            onClick={onClose}
            className="bg-rose-400 px-4 py-2 rounded-xl text-green-100 font-bold shadow-md"
          >
            Cancel
          </button>
        </div>

        <form className="w-full grid grid-cols-6 grid-rows-4 gap-2" onSubmit={handleUpdateTransaction}>
          <div className="flex flex-col items-center justify-center w-full col-span-4">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Description</h1>
            <input
              type="text"
              className="bg-green-100 rounded-xl px-4 py-2 w-full shadow-sm"
              placeholder="Frog food, rent, etc."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="flex flex-col items-center justify-center w-full col-span-2">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Amount</h1>
            <input
              type="number"
              className="bg-green-100 rounded-xl px-4 py-2 w-full text-right shadow-sm"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="relative flex flex-col items-center justify-center w-full col-span-3">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Category</h1>
            <button
              type="button"
              className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center justify-between"
              onClick={() => {
                setCardModalOpen(false);
                setTimeframeModalOpen(false);
                setCategoryModalOpen((open) => !open);
              }}
            >
              <span className="truncate">{categories.find((category) => category.id === categoryId)?.name || "Select Category"}</span>
              <FaChevronDown className={`ml-2 ${categoryModalOpen ? "transform rotate-180" : ""}`} />
            </button>
            {categoryModalOpen && (
              <div className="absolute top-full left-0 z-40 bg-green-100 rounded-xl shadow-lg py-1 mt-2 w-full">
                {categories.map((categoryItem) => (
                  <div
                    key={categoryItem.id}
                    className="px-4 py-2.5 rounded cursor-pointer truncate whitespace-nowrap"
                    title={categoryItem.name}
                    onClick={() => {
                      setCategoryId(categoryItem.id);
                      setCategoryModalOpen(false);
                    }}
                  >
                    {categoryItem.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex flex-col items-center justify-center w-full col-span-3">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Card</h1>
            <button
              type="button"
              className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full text-left flex items-center justify-between"
              onClick={() => {
                setCategoryModalOpen(false);
                setTimeframeModalOpen(false);
                setCardModalOpen((open) => !open);
              }}
            >
              <span className="truncate">{cards.find((cardItem) => cardItem.id === cardId)?.name || "Select Card"}</span>
              <FaChevronDown className={`ml-2 ${cardModalOpen ? "transform rotate-180" : ""}`} />
            </button>
            {cardModalOpen && (
              <div className="absolute top-full left-0 z-40 bg-green-100 rounded-xl shadow-lg py-1 mt-2 w-full">
                {cards.map((cardItem) => (
                  <div
                    key={cardItem.id}
                    className="px-4 py-2.5 rounded cursor-pointer truncate whitespace-nowrap"
                    title={cardItem.name}
                    onClick={() => {
                      setCardId(cardItem.id);
                      setCardModalOpen(false);
                    }}
                  >
                    {cardItem.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center w-full col-span-3">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Date</h1>
            <input
              type="date"
              className="bg-green-100 rounded-xl px-4 py-2 w-full text-right shadow-sm"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="relative flex flex-col items-center justify-center w-full col-span-3">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Recurring</h1>
            <button
              type="button"
              className="bg-green-100 font-semibold text-slate-600 py-2 px-4 rounded-xl w-full h-full flex items-center justify-between"
              onClick={() => {
                setCategoryModalOpen(false);
                setCardModalOpen(false);
                setTimeframeModalOpen((open) => !open);
              }}
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

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-[#4aba68] text-green-100 font-berky text-3xl py-2 rounded-xl col-start-3 col-end-7 row-start-4 row-end-5 w-[50%] self-center -rotate-3 shadow-md floatAnimationSmall"
          >
            {loading ? "Saving..." : "Save"}
            <img src={FrogHead} alt="Frog Head" className="w-8 h-8 inline-block ml-2" />
          </button>

          <button
            type="button"
            disabled={loading}
            className="mt-4 w-full bg-rose-400 text-green-100 text-lg font-bold py-2 rounded-xl col-start-1 col-end-3 row-start-4 row-end-5 w-[50%] self-center shadow-md flex items-center justify-center"
            onClick={handleDeleteTransaction}
          >
            {loading ? "Deleting..." : "Delete"}
            <AiOutlineDelete className="w-6 h-6 inline-block ml-2" />
          </button>

          {errorMsg && <p className="text-rose-400 text-sm col-span-6 text-center mt-2">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
}
