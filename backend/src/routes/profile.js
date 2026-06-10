const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

function toNumber(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toWeeklyEquivalent(amount, timeframe) {
    switch (timeframe) {
        case 'Daily':
            return amount * 7;
        case 'Weekly':
            return amount;
        case 'Bi-Weekly':
            return amount / 2;
        case 'Monthly':
            return amount / 4.345;
        case 'Once':
        default:
            return 0;
    }
}

function getInclusiveWeekSpan(dates) {
    if (!dates || dates.length === 0) {
        return 1;
    }

    let minDate = dates[0];
    let maxDate = dates[0];

    dates.forEach((date) => {
        if (date < minDate) {
            minDate = date;
        }
        if (date > maxDate) {
            maxDate = date;
        }
    });

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daySpan = Math.floor((maxDate - minDate) / millisecondsPerDay);
    return Math.floor(daySpan / 7) + 1;
}

async function calculateAverageWeeklyIncome(userId) {
    const { data: incomeCategories, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'income');

    if (categoryError) {
        throw categoryError;
    }

    const categoryIds = (incomeCategories || []).map((category) => category.id);
    if (categoryIds.length === 0) {
        return 0;
    }

    const { data: incomeTransactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount, timeframe, date')
        .eq('user_id', userId)
        .in('category_id', categoryIds);

    if (transactionError) {
        throw transactionError;
    }

    const incomeTransactionDates = (incomeTransactions || [])
        .map((transaction) => new Date(transaction.date))
        .filter((date) => !Number.isNaN(date.getTime()));
    const weekSpan = getInclusiveWeekSpan(incomeTransactionDates);

    const recurringWeeklyIncome = (incomeTransactions || []).reduce((sum, transaction) => {
        const amount = toNumber(transaction.amount);
        if ((transaction.timeframe || 'Once') === 'Once') {
            return sum;
        }

        return sum + toWeeklyEquivalent(amount, transaction.timeframe);
    }, 0);

    const onceIncomePastYear = (incomeTransactions || []).reduce((sum, transaction) => {
        const timeframe = transaction.timeframe || 'Once';
        if (timeframe !== 'Once') {
            return sum;
        }

        return sum + toNumber(transaction.amount);
    }, 0);

    const weeklyFromOneTimeIncome = onceIncomePastYear / weekSpan;
    const averageWeeklyIncome = recurringWeeklyIncome + weeklyFromOneTimeIncome;

    return Number.parseFloat(averageWeeklyIncome.toFixed(2));
}

async function upsertUserIncome(userId, income) {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            income,
        }, { onConflict: 'id' })
        .select('income')
        .single();

    if (error) {
        throw error;
    }

    return data?.income ?? 0;
}

router.get('/', async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User session not found.' });
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('income')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (data && data.income !== null && data.income !== undefined) {
            return res.status(200).json({ income: toNumber(data.income), source: 'saved' });
        }

        const calculatedIncome = await calculateAverageWeeklyIncome(userId);
        const savedIncome = await upsertUserIncome(userId, calculatedIncome);

        return res.status(200).json({ income: savedIncome, source: 'calculated' });
    } catch (error) {
        console.error('Profile fetch error:', error.message || error);
        return res.status(500).json({ error: error.message || 'Internal server error retrieving profile.' });
    }
});

router.put('/income', async (req, res) => {
    const userId = req.user?.id;
    const parsedIncome = Number.parseFloat(req.body?.income);

    if (!userId) {
        return res.status(401).json({ error: 'User session not found.' });
    }

    if (!Number.isFinite(parsedIncome) || parsedIncome < 0) {
        return res.status(400).json({ error: 'Income must be a valid non-negative number.' });
    }

    try {
        const savedIncome = await upsertUserIncome(userId, Number.parseFloat(parsedIncome.toFixed(2)));
        return res.status(200).json({ income: savedIncome, source: 'saved' });
    } catch (error) {
        console.error('Profile income save error:', error.message || error);
        return res.status(500).json({ error: error.message || 'Internal server error saving profile income.' });
    }
});

router.post('/income/calculate', async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User session not found.' });
    }

    try {
        const calculatedIncome = await calculateAverageWeeklyIncome(userId);
        const savedIncome = await upsertUserIncome(userId, calculatedIncome);

        return res.status(200).json({ income: savedIncome, source: 'calculated' });
    } catch (error) {
        console.error('Profile income calculate error:', error.message || error);
        return res.status(500).json({ error: error.message || 'Internal server error calculating profile income.' });
    }
});

module.exports = router;
