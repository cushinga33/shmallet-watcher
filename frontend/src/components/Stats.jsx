import React, { useMemo, useState, useEffect, useRef } from "react";
import { fetchCategories as fetchCategoriesApi } from "../services/categoryService";
import { fetchCards as fetchCardsApi } from "../services/cardService";
import {
    createTransaction,
    fetchTransactions as fetchTransactionsApi,
} from "../services/transactionService";
import { fetchProfileIncome as fetchProfileIncomeApi } from "../services/profileService";
import { TimelineView } from "./stats/TimelineView";
import { NewTransactionView } from "./stats/NewTransactionView";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const STATUS_MESSAGE_TIMEOUT_MS = 3000;
const SWIPE_THRESHOLD_PX = 40;

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});

function formatCurrency(amount) {
    return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

function toNumber(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getLocalDayBounds(dateValue) {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getCurrentWeekRange(referenceDate = new Date()) {
    const start = getLocalDayBounds(referenceDate);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

function getCurrentMonthRange(referenceDate = new Date()) {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

function getCurrentYearRange(referenceDate = new Date()) {
    const start = new Date(referenceDate.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(referenceDate.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

function parseTransactionDate(dateValue) {
    if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date(dateValue);
}

function isDateInRange(dateValue, range) {
    const current = parseTransactionDate(dateValue);
    if (Number.isNaN(current.getTime())) {
        return false;
    }

    return current >= range.start && current <= range.end;
}

function adjustAmountForView(amount, timeframe, view) {
    switch (view) {
        case "week":
            switch (timeframe) {
                case "Daily":
                    return amount * 7;
                case "Monthly":
                    return amount / 4.345;
                case "Bi-Weekly":
                    return amount / 2;
                case "Weekly":
                case "Once":
                default:
                    return amount;
            }
        case "month":
            switch (timeframe) {
                case "Daily":
                    return amount * 30;
                case "Weekly":
                    return amount * 4.345;
                case "Bi-Weekly":
                    return amount * 2;
                case "Monthly":
                case "Once":
                default:
                    return amount;
            }
        case "year":
            switch (timeframe) {
                case "Daily":
                    return amount * 365;
                case "Weekly":
                    return amount * 52;
                case "Bi-Weekly":
                    return amount * 26;
                case "Monthly":
                    return amount * 12;
                case "Once":
                default:
                    return amount;
            }
        default:
            return amount;
    }
}

function adjustBudgetForView(budget, timeframe, view) {
    switch (view) {
        case "week":
            switch (timeframe) {
                case "Daily":
                    return budget * 7;
                case "Monthly":
                    return budget / 4.345;
                case "Bi-Weekly":
                    return budget / 2;
                case "Weekly":
                case "Once":
                default:
                    return budget;
            }
        case "month":
            switch (timeframe) {
                case "Daily":
                    return budget * 30;
                case "Weekly":
                    return budget * 4.345;
                case "Bi-Weekly":
                    return budget * 2;
                case "Monthly":
                case "Once":
                default:
                    return budget;
            }
        case "year":
            switch (timeframe) {
                case "Daily":
                    return budget * 365;
                case "Weekly":
                    return budget * 52;
                case "Bi-Weekly":
                    return budget * 26;
                case "Monthly":
                    return budget * 12;
                case "Once":
                default:
                    return budget;
            }
        default:
            return budget;
    }
}

function adjustMonthlyIncomeForView(monthlyIncome, view) {
    switch (view) {
        case "week":
            return monthlyIncome / 4.345;
        case "month":
            return monthlyIncome;
        case "year":
            return monthlyIncome * 12;
        default:
            return monthlyIncome;
    }
}

function buildTimelineSnapshot({ range, categories, transactions, view, monthlyProfileIncome }) {
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const expenseCategories = categories.filter((category) => category.type === "expense");
    const shouldEstimateRecurring = view === "week";
    const inRangeTransactions = transactions.filter((transaction) =>
        shouldEstimateRecurring && transaction.timeframe && transaction.timeframe !== "Once"
            ? true
            : isDateInRange(transaction.date, range),
    );

    let totalIncome = 0;
    let totalExpense = 0;

    const spentByCategory = new Map();

    inRangeTransactions.forEach((transaction) => {
        const fallbackCategory = categoryById.get(transaction.category_id);
        const categoryType = (transaction.category?.type || fallbackCategory?.type || "expense").toLowerCase();
        const amount = toNumber(transaction.amount);
        const adjustedAmount = shouldEstimateRecurring
            ? adjustAmountForView(amount, transaction.timeframe, view)
            : amount;

        if (categoryType === "income") {
            totalIncome += adjustedAmount;
            return;
        }
        totalExpense += adjustedAmount;
        if (typeof transaction.category_id === "number") {
            const runningSpent = spentByCategory.get(transaction.category_id) || 0;
            spentByCategory.set(transaction.category_id, runningSpent + adjustedAmount);
        }
    });

    const totalBudget = expenseCategories.reduce((total, category) => {
        const value = category.budget_limit;
        if (value === null || value === undefined || value === "") {
            return total;
        }

        return total + toNumber(value);
    }, 0);

    const incomeForView = view === "week" && Number.isFinite(monthlyProfileIncome)
        ? adjustMonthlyIncomeForView(monthlyProfileIncome, view)
        : totalIncome;
    const netAmount = incomeForView - totalExpense;

    const categoryRows = expenseCategories.map((category) => {
        const spent = spentByCategory.get(category.id) || 0;
        const hasBudget = category.budget_limit !== null && category.budget_limit !== undefined && category.budget_limit !== "";
        const budget = hasBudget ? toNumber(category.budget_limit) : null;
        const available = hasBudget ? adjustBudgetForView(budget, category.timeframe, view) - spent : null;
        const categoryTransactions = inRangeTransactions
            .filter((transaction) => transaction.category_id === category.id)
            .map((transaction) => ({
                ...transaction,
                adjustedAmount: shouldEstimateRecurring
                    ? adjustAmountForView(toNumber(transaction.amount), transaction.timeframe, view)
                    : toNumber(transaction.amount),
                isEstimated: shouldEstimateRecurring && transaction.timeframe !== "Once",
            }));

        return {
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            spent,
            available,
            hasBudget,
            transactions: categoryTransactions,
        };
    });

    return {
        totals: {
            spent: totalExpense,
            income: incomeForView,
            net: netAmount,
        },
        categoryRows,
    };
}

export function Stats() {
    const timeframes = ["Once", "Monthly", "Bi-Weekly", "Weekly", "Daily"];

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [categories, setCategories] = useState([]);
    const [category, setSelectedCategory] = useState(null);
    const [cards, setCards] = useState([]);
    const [card, setSelectedCard] = useState(null);
    const [date, setDate] = useState(getTodayDate);
    const [timeframe, setTimeframe] = useState(0);
    const [transactions, setTransactions] = useState([]);

    const [currentSlide, setCurrentSlide] = useState(0);
    const touchStartXRef = useRef(null);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const categoryDropdownRef = useRef(null);

    const [cardModalOpen, setCardModalOpen] = useState(false);
    const cardDropdownRef = useRef(null);

    const [timeframeModalOpen, setTimeframeModalOpen] = useState(false);
    const timeframeDropdownRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");
    const [cardsLoading, setCardsLoading] = useState(true);
    const [cardsError, setCardsError] = useState("");
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [transactionsError, setTransactionsError] = useState("");
    const [monthlyProfileIncome, setMonthlyProfileIncome] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

    useEffect(() => {
        function handleClickOutside(event) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setCategoryModalOpen(false);
            }

            if (cardDropdownRef.current && !cardDropdownRef.current.contains(event.target)) {
                setCardModalOpen(false);
            }

            if (timeframeDropdownRef.current && !timeframeDropdownRef.current.contains(event.target)) {
                setTimeframeModalOpen(false);
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

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const data = await fetchTransactionsApi();
                setTransactions(data || []);
            } catch (error) {
                setTransactionsError(error.message);
            } finally {
                setTransactionsLoading(false);
            }
        };

        loadTransactions();
    }, []);

    useEffect(() => {
        const loadProfileIncome = async () => {
            try {
                const income = await fetchProfileIncomeApi();
                setMonthlyProfileIncome(Number.isFinite(Number(income)) ? Number(income) : null);
            } catch {
                // Keep timeline usable with transaction-derived income fallback.
            }
        };

        loadProfileIncome();
    }, []);

    useEffect(() => {
        if (!statusMessage.message) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setStatusMessage({ type: "", message: "" });
        }, STATUS_MESSAGE_TIMEOUT_MS);

        return () => window.clearTimeout(timeoutId);
    }, [statusMessage.message]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setStatusMessage({ type: "", message: "" });

        if (!category) {
            setStatusMessage({ type: "error", message: "Please select a category." });
            setLoading(false);
            return;
        }

        if (!card) {
            setStatusMessage({ type: "error", message: "Please select a card." });
            setLoading(false);
            return;
        }

        try {
            const createdTransaction = await createTransaction({
                description,
                amount: Number.parseFloat(amount),
                date,
                card_id: card,
                category_id: category,
                timeframe: timeframes[timeframe],
            });

            setTransactions((current) => [createdTransaction, ...current]);
            setStatusMessage({ type: "success", message: "Transaction logged!" });
            setDescription("");
            setAmount("");
            setDate(getTodayDate());
        } catch (error) {
            setStatusMessage({ type: "error", message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const timelineSlides = useMemo(() => {
        const weekData = buildTimelineSnapshot({
            range: getCurrentWeekRange(),
            categories,
            transactions,
            view: "week",
            monthlyProfileIncome,
        });

        const monthData = buildTimelineSnapshot({
            range: getCurrentMonthRange(),
            categories,
            transactions,
            view: "month",
            monthlyProfileIncome,
        });

        const yearData = buildTimelineSnapshot({
            range: getCurrentYearRange(),
            categories,
            transactions,
            view: "year",
            monthlyProfileIncome,
        });

        return [
            { id: "week", title: "This Week", data: weekData },
            { id: "month", title: "This Month", data: monthData },
            { id: "year", title: "This Year", data: yearData },
        ];
    }, [categories, transactions, monthlyProfileIncome]);

    const allSlides = [{ id: "new-transaction", title: "New Transaction" }, ...timelineSlides];
    const slideCardClassName = "relative z-20 flex flex-1 h-full items-center justify-center bg-linear-to-br from-green-100/30 to-green-200/10 rounded-4xl p-3 w-full border-green-100/15 border-1 backdrop-blur-sm shadow-sm";

    const goToSlide = (index) => {
        if (index < 0) {
            setCurrentSlide(allSlides.length - 1);
            return;
        }

        if (index >= allSlides.length) {
            setCurrentSlide(0);
            return;
        }

        setCurrentSlide(index);
        console.log(index);
        console.log(allSlides[index]);
    };

    const handleTouchStart = (event) => {
        touchStartXRef.current = event.touches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event) => {
        const startX = touchStartXRef.current;
        const endX = event.changedTouches[0]?.clientX ?? null;
        touchStartXRef.current = null;

        if (startX === null || endX === null) {
            return;
        }

        const deltaX = endX - startX;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
            return;
        }

        if (deltaX < 0) {
            goToSlide(currentSlide + 1);
            return;
        }

        goToSlide(currentSlide - 1);
    };

    return (
        <div className="flex flex-col h-full items-center justify-start gap-2 z-100 w-full min-h-0">

            <div
                className="w-full flex-1 min-h-0"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-300 ease-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    <div className={`w-full h-full shrink-0 ${allSlides[currentSlide].id === "new-transaction" ? "opacity-100" : "opacity-0"} transition-opacity duration-300 ease-out`}>
                        <div className={slideCardClassName}>
                            <NewTransactionView
                                description={description}
                                setDescription={setDescription}
                                amount={amount}
                                setAmount={setAmount}
                                categories={categories}
                                categoriesLoading={categoriesLoading}
                                categoriesError={categoriesError}
                                category={category}
                                setSelectedCategory={setSelectedCategory}
                                categoryModalOpen={categoryModalOpen}
                                setCategoryModalOpen={setCategoryModalOpen}
                                categoryDropdownRef={categoryDropdownRef}
                                cards={cards}
                                cardsLoading={cardsLoading}
                                cardsError={cardsError}
                                card={card}
                                setSelectedCard={setSelectedCard}
                                cardModalOpen={cardModalOpen}
                                setCardModalOpen={setCardModalOpen}
                                cardDropdownRef={cardDropdownRef}
                                date={date}
                                setDate={setDate}
                                timeframe={timeframe}
                                setTimeframe={setTimeframe}
                                timeframeModalOpen={timeframeModalOpen}
                                setTimeframeModalOpen={setTimeframeModalOpen}
                                timeframeDropdownRef={timeframeDropdownRef}
                                timeframes={timeframes}
                                loading={loading}
                                onSubmit={handleSubmit}
                                statusMessage={statusMessage}
                            />
                        </div>
                    </div>
                    {timelineSlides.map((slide) => (
                        <div key={slide.id} className="w-full h-full shrink-0">
                            <div className={`${slideCardClassName} ${slide.id === allSlides[currentSlide].id ? "opacity-100" : "opacity-0"} transition-opacity duration-300 ease-out`}>
                                <TimelineView
                                    title={slide.title}
                                    timelineData={slide.data}
                                    loading={categoriesLoading || transactionsLoading}
                                    error={categoriesError || transactionsError}
                                    formatCurrency={formatCurrency}
                                />
                            </div>
                        </div>
                    ))}

                </div>
            </div>
            <div className="flex items-center gap-1">
                {allSlides.map((slide, index) => (
                    <button
                        key={slide.id}
                        type="button"
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to ${slide.title}`}
                        className={`h-2 rounded-full transition-all ${currentSlide === index ? "w-5 bg-green-100" : "w-2 bg-green-100/45"}`}
                    />
                ))}
            </div>
        </div>
    );
}
