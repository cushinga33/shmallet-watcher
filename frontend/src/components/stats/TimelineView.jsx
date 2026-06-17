import React from "react";
import { getCategoryIconByName } from "../../assets/categoryIcons";
import { userColorChoices } from "../../assets/userColorChoices";
import { FaDollarSign } from "react-icons/fa";

export function TimelineView({ title, timelineData, loading, error, formatCurrency, isCompactHeight = false }) {
    const [expandedRowId, setExpandedRowId] = React.useState(null);
    const maxHeightClass = isCompactHeight ? "max-h-[30dvh]" : "max-h-[60dvh]";

    return (
        <div className={`w-full ${maxHeightClass} flex flex-col gap-3 py-3`}>
            <div className="flex items-center justify-center">
                <h1 className="text-3xl font-berky text-green-200 text-center">{title}</h1>
            </div>

            {loading ? (
                <div className="w-full flex-1 flex items-center justify-center text-green-100 animate-pulse font-semibold">
                    Crunching budget flies...
                </div>
            ) : error ? (
                <div className="w-full flex-1 flex items-center justify-center text-rose-300 font-semibold text-center px-2">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-100 rounded-2xl p-2 text-center shadow-sm">
                            <p className="text-lg leading-none font-bold text-slate-700 truncate">{formatCurrency(timelineData.totals.spent)}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Spent</p>
                        </div>
                        <div className="bg-green-100 rounded-2xl p-2 text-center shadow-sm">
                            <p className="text-lg leading-none font-bold text-slate-700 truncate">{formatCurrency(timelineData.totals.income)}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">{timelineData.totals.incomeIsEstimated ? "Est. " : ""}Income</p>
                        </div>
                        <div className="bg-green-100 rounded-2xl p-2 text-center shadow-sm">
                            <p className="text-lg leading-none font-bold text-slate-700 truncate">{formatCurrency(timelineData.totals.net)}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">{timelineData.totals.incomeIsEstimated ? "Est. " : ""}Net</p>
                        </div>
                    </div>

                    <div className="flex-1 h-full overflow-y-auto">
                        <div className="grid grid-cols-12 px-1 pb-2 text-sm font-bold text-slate-600 tracking-wide">

                            <span className="col-span-3">Category</span>
                            <span className="col-span-5 text-right">Spent</span>
                            <span className="col-span-4 text-right">Available</span>
                        </div>
                        {timelineData.categoryRows.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-500 py-5">
                                No categories yet.
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-1 h-full overflow-y-auto pb-8">
                                {timelineData.categoryRows.map((row) => (
                                    <div key={row.id}>
                                        <li className="grid grid-cols-12 items-center bg-green-100/90 rounded-xl px-2 py-2 shadow-xs cursor-pointer" onClick={() => setExpandedRowId((current) => current === row.id ? null : row.id)} style={expandedRowId !== row.id && expandedRowId !== null ? { filter: "brightness(0.85)" } : {}}>
                                            <span className="col-span-5 font-semibold text-slate-700 truncate flex items-center gap-1.5" title={row.name}>
                                                <span className="w-5 h-5 shrink-0 flex items-center justify-center">{getCategoryIconByName(row.icon, userColorChoices[row.color])}</span>
                                                {row.name}
                                            </span>
                                            <span className="col-span-3 text-right font-semibold text-slate-700">{row.type === "income" ? "-" : formatCurrency(row.spent)}</span>
                                            <span className="col-span-4 text-right font-semibold text-slate-600" style={row.type === "income" ? { color: "#34d399" } : {}}>
                                                {row.type === "income" ? formatCurrency(row.available) : (row.hasBudget ? formatCurrency(row.available) : "N/A")}
                                            </span>
                                        </li>
                                        {expandedRowId === row.id && (
                                            <ul className="mt-1 mb-2 ml-4 flex flex-col gap-1">
                                                {row.transactions.map((transaction, index) => (
                                                    <li key={transaction.id ?? `${row.id}-${transaction.date}-${transaction.description}-${index}`} className="grid grid-cols-12 items-center bg-green-100/90 rounded-xl px-2 py-2 shadow-xs text-sm">
                                                        <span className="col-span-8 font-semibold text-slate-700 truncate" title={transaction.description}>{transaction.description}{transaction.timeframe !== 'Once' && ` (Recurring ${transaction.timeframe})`}</span>
                                                        <span className="col-span-4 text-right font-semibold text-slate-700">{transaction.isEstimated ? `Est. ${formatCurrency(transaction.adjustedAmount)}` : formatCurrency(transaction.adjustedAmount ?? transaction.amount)}</span>
                                                        {/* <span className="col-span-4 text-right font-semibold text-slate-600">
                                                            {transaction.hasBudget ? formatCurrency(transaction.available) : "N/A"}
                                                        </span> */}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
 
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
