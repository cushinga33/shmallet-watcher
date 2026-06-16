import React, { useState } from "react";
import FrogHead from "../assets/FrogHead.svg";
import { createCard } from "../services/cardService";
import { FaChevronDown } from "react-icons/fa6";
import { buildCardIcons, cardIconDefs } from "../assets/cardIcons";
import { userColorChoices } from "../assets/userColorChoices";

const DEFAULT_CARD_ICON_NAME = "CreditCard";

export function AddCardModal({ isClosing, onClose, onCardAdded }) {
  const [name, setName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardColor, setCardColor] = useState(6);
  const [cardIcon, setCardIcon] = useState(() => {
    const iconIndex = cardIconDefs.findIndex((icon) => icon.name === DEFAULT_CARD_ICON_NAME);
    return iconIndex >= 0 ? iconIndex : 0;
  });
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const icons = buildCardIcons(userColorChoices[cardColor], 30);
  const colors = userColorChoices;

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
        color: userColorChoices[cardColor],
        icon: icons[cardIcon].name,
      });

      onCardAdded(card);
      setName("");
      setLastFour("");
      setCardLimit("");
      setCardColor(0);
      const iconIndex = cardIconDefs.findIndex((icon) => icon.name === DEFAULT_CARD_ICON_NAME);
      setCardIcon(iconIndex >= 0 ? iconIndex : 0);
      setIconModalOpen(false);
      setColorModalOpen(false);
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
            setIconModalOpen(false);
            setColorModalOpen(false);

          }
        }}
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

          <div className="relative flex flex-col items-center justify-center w-full col-span-1">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Color</h1>
            <button type="button" className="w-full h-full p-2 bg-green-100 rounded-xl" onClick={() => setColorModalOpen((open) => {
              setIconModalOpen(false);
              return !open;
            })}>
              <div className="rounded w-full h-full items-center justify-center flex" style={{ backgroundColor: colors[cardColor] }} />              
            </button>
            {colorModalOpen && (
              <div className="absolute top-full right-0 bg-green-100 p-2 rounded-xl shadow-lg mt-2 grid grid-cols-4 gap-1 z-20 w-55">
                {colors.map((color, index) => (
                  <div
                    key={color}
                    className="p-2 rounded cursor-pointer items-center justify-center flex aspect-square"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setCardColor(index);
                      setColorModalOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative flex flex-col items-center justify-center w-full col-span-1">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Icon</h1>
            <button
              type="button"
              className="bg-green-100 font-semibold text-slate-600 p-1 rounded-xl w-full h-full flex items-center justify-center"
              onClick={() => setIconModalOpen((open) => {
                setColorModalOpen(false);
                return !open;
              })}
            >
              {icons[cardIcon].icon}
            </button>
            {iconModalOpen && (
              <div className="absolute top-full right-0 bg-green-100 rounded-xl shadow-lg mt-2 grid grid-cols-4 gap-1 z-20 w-55">
                {icons.map((icon, index) => (
                  <div
                    key={icon.name}
                    className="p-2 rounded cursor-pointer items-center justify-center flex"
                    onClick={() => {
                      setCardIcon(index);
                      setIconModalOpen(false);
                    }}
                  >
                    {icon.icon}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center w-full col-span-3">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Last 4</h1>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="1234"
              className="w-full px-4 py-2 rounded-xl bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm placeholder:text-slate-400 text-slate-600 text-left"
              value={lastFour}
              onChange={(event) => setLastFour(event.target.value)}
            />
          </div>

          <div className="flex flex-col items-center justify-center w-full col-span-3 relative">
            <h1 className="text-lg self-start w-full font-semibold text-green-200">Card Limit (Monthly)</h1>
            <input
              type="number"
              placeholder="0.00"
              className="w-full px-4 py-2 rounded-xl bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm placeholder:text-slate-400 text-slate-600 text-right"
              value={cardLimit}
              onChange={(event) => setCardLimit(event.target.value)}
            />
            <span className="text-xl font-bold text-green-400 absolute left-3 top-1/2">$</span>
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
