import React from "react";

function formatCardLimit(cardLimit) {
  if (cardLimit === null || cardLimit === undefined || cardLimit === "") {
    return "No limit set";
  }

  return `$${cardLimit}`;
}

function formatLastFour(lastFour) {
  if (!lastFour) {
    return "No last 4 added";
  }

  return `•••• ${lastFour}`;
}

export function CardList({ loading, errorMsg, cards }) {
  if (loading) {
    return <div className="p-4 text-green-100 w-full text-center animate-pulse">Loading cards...</div>;
  }

  if (errorMsg) {
    return <div className="p-4 text-green-100 w-full text-center">{errorMsg}</div>;
  }

  if (cards.length === 0) {
    return <div className="p-4 text-green-100 w-full text-center">Add some cards!</div>;
  }

  return (
    <ul className="w-full max-w-3xl flex flex-col gap-2">
      {cards.map((card) => (
        <li key={card.id} className="p-2">
          <button className="w-full h-full flex flex-col">
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-green-100 text-lg">{card.name}</span>
                <div className="text-md text-green-200 flex gap-1 items-center">{formatLastFour(card.last_four)}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-green-100 text-right">{formatCardLimit(card.card_limit)}</div>
              </div>
            </div>
            <div className="h-[2px] bg-green-100/30 rounded-full" />
          </button>
        </li>
      ))}
    </ul>
  );
}
