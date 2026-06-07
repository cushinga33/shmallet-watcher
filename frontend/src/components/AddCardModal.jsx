import React, { useState } from "react";
import FrogHead from "../assets/FrogHead.svg";
import { createCard } from "../services/cardService";

export function AddCardModal({ isClosing, onClose, onCardAdded }) {
  const [name, setName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddCard = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMsg("Card name is required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const card = await createCard({
        name: name.trim(),
        last_four: lastFour.trim(),
        card_limit: cardLimit ? parseFloat(cardLimit) : null,
      });

      onCardAdded(card);
      setName("");
      setLastFour("");
      setCardLimit("");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 w-full h-screen flex top-0 items-end ${!isClosing ? "backdrop-blur-sm" : ""} transition-all duration-300`}
      onClick={onClose}
    >
      <div
        className={`bg-linear-to-br from-green-100/30 to-green-200/10 p-3 border-green-100/15 border-1 backdrop-blur-sm shadow-sm w-full h-[85%] rounded-t-3xl flex flex-col gap-2 ${isClosing ? "slideOutDownAnimation" : "slideInUpAnimation"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <h1 className="text-3xl font-berky text-green-200 text-left flex items-center gap-2">
            Add Card
          </h1>
          <button
            onClick={onClose}
            className="bg-rose-400 px-4 py-2 rounded-xl text-green-100 font-bold shadow-md"
          >
            Cancel
          </button>
        </div>

        <form className="w-full grid grid-cols-6 grid-rows-3 gap-2" onSubmit={handleAddCard}>
          <div className="flex flex-col items-center justify-center w-full col-span-4">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Card Name</h1>
            <input
              type="text"
              placeholder="Visa"
              className="w-full px-4 py-2 rounded-xl bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm placeholder:text-slate-400 text-slate-600"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="flex flex-col items-center justify-center w-full col-span-2">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Last 4</h1>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="1234"
              className="w-full px-4 py-2 rounded-xl bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm placeholder:text-slate-400 text-slate-600 text-right"
              value={lastFour}
              onChange={(event) => setLastFour(event.target.value)}
            />
          </div>

          <div className="flex flex-col items-center justify-center w-full col-span-3">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Card Limit</h1>
            <input
              type="number"
              placeholder="0.00"
              className="w-full px-4 py-2 rounded-xl bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm placeholder:text-slate-400 text-slate-600 text-right"
              value={cardLimit}
              onChange={(event) => setCardLimit(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-[#4aba68] text-green-100 font-berky text-3xl py-2 rounded-xl col-start-2 col-end-6 w-[50%] self-center -rotate-3 shadow-md floatAnimationSmall"
          >
            {loading ? "Saving..." : "Save"}
            <img src={FrogHead} alt="Frog Head" className="w-8 h-8 inline-block ml-2" />
          </button>

          {errorMsg && <p className="text-rose-400 text-sm col-span-6 text-center mt-2">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
}
