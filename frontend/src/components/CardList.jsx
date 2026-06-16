import React from "react";
import { getCardIconByName } from "../assets/cardIcons";

function formatCardLimit(cardLimit) {
  return `$${cardLimit}`;
}

function formatLastFour(lastFour) {
  return `•••• ${lastFour}`;
}

export function CardList({ loading, errorMsg, cards, onEdit }) {
  if (loading) {
    return <div className="p-4 text-green-100 w-full text-center animate-pulse">Loading cards...</div>;
  }

  if (errorMsg) {
    return <div className="p-4 text-green-100 w-full text-center">{errorMsg}</div>;
  }

  if (cards.length === 0) {
    return <div className="p-4 text-green-100 w-full text-center">Add some cards!</div>;
  }

  const getCardIcon = (iconName, color) => {
    return getCardIconByName(iconName, color || "#ffffff", 22);
  };

  return (
    <ul className="w-full max-w-3xl flex flex-col">
      {cards.map((card) => (
        <li key={card.id} className="py-1">
          <button className="w-full h-full flex flex-col" onClick={() => onEdit?.(card)}>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                  {getCardIcon(card.icon, card.color)}
                </div>
                <span className="font-semibold text-green-100 text-lg">{card.name}</span>
                {card.is_archived && <span className="text-xs text-green-300">(Archived)</span>}
                <div className="text-md text-green-200 flex gap-1 items-center">{card.last_four && formatLastFour(card.last_four)}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-lg font-bold text-green-200 text-right">{card.card_limit && formatCardLimit(card.card_limit)}</div>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
