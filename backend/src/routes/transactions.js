const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseTransactionId(rawId) {
    if (typeof rawId !== 'string') {
        return null;
    }

    const normalizedId = rawId.trim();
    if (!UUID_REGEX.test(normalizedId)) {
        return null;
    }

    return normalizedId;
}

//  Upload transactions
router.post('/', async (req, res) => {
    const { description, amount, date, card_id, category_id, timeframe } = req.body;

    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User session not found.' });
    }

    if (!description || !amount || !date || !category_id ) {
        return res.status(400).json({ error: 'Please fill all required fields.'})
    }

    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([
                {
                    user_id: userId,
                    description,
                    amount: parseFloat(amount),
                    date,
                    card_id: card_id,
                    category_id: category_id,
                    timeframe
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Success!!!', transaction: data[0]});
    }
    catch (error) {
        console.error('Database insertion failure:', error.message || error);
        res.status(500).json({error: error.message || 'Internal server error processing transaction entry.'});
    }
});

// Update transaction
router.put('/:id', async (req, res) => {
    const userId = req.user?.id;
    const transactionId = parseTransactionId(req.params.id);
    const { description, amount, date, card_id, category_id, timeframe } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User session not found.' });
    }

    if (!transactionId) {
        return res.status(400).json({ error: 'Invalid transaction id.' });
    }

    if (!description || amount === undefined || amount === null || !date || !category_id) {
        return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    try {
        const { data, error } = await supabase
            .from('transactions')
            .update({
                description,
                amount: parseFloat(amount),
                date,
                card_id: card_id || null,
                category_id,
                timeframe,
            })
            .eq('id', transactionId)
            .eq('user_id', userId)
            .select('*, category:categories(name, type, color, icon), card:cards(name, last_four)')
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Transaction not found.' });
        }

        res.status(200).json({ message: 'Transaction updated.', transaction: data });
    }
    catch (error) {
        console.error('Database update failure:', error.message || error);
        res.status(500).json({ error: error.message || 'Internal server error processing transaction update.' });
    }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
    const userId = req.user?.id;
    const transactionId = parseTransactionId(req.params.id);

    if (!userId) {
        return res.status(401).json({ error: 'User session not found.' });
    }

    if (!transactionId) {
        return res.status(400).json({ error: 'Invalid transaction id.' });
    }

    try {
        const { data, error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', transactionId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Transaction not found.' });
        }

        res.status(200).json({ message: 'Transaction deleted.', transaction: data });
    }
    catch (error) {
        console.error('Database delete failure:', error.message || error);
        res.status(500).json({ error: error.message || 'Internal server error processing transaction delete.' });
    }
});

// Get Transactions
router.get('/', async (req, res) => {
    const userId = req.user?.id;

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, category:categories(name, type, color, icon), card:cards(name, last_four)')
            .eq('user_id', userId)
            .order('date', {ascending: false})
            .order('created_at', {ascending: false})
        if (error) throw error;

        res.status(200).json(data);
    }
    catch (error) {
        console.error('Error fetching transactions: ', error);
        res.status(500).json({error: 'Internal server error retrieving transactions'});
    }
})

// @route   POST /api/transactions/bulk
// @desc    Insert a mass batch array of formatted CSV records in a single call
router.post('/bulk', async (req, res) => {
    const { transactions } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User session not found.' });
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: 'No transaction dataset provided for batch upload.' });
    }

    // Explicitly prepare rows to clean inputs, format floats, and map keys securely
    const preparedRecords = transactions.map(tx => {
        if (!tx.description || !tx.amount || !tx.date) {
            throw new Error('Malformed record discovered in upload array. Description, amount, and date are strict rules.');
        }
        return {
            user_id: userId,
            description: tx.description,
            amount: parseFloat(tx.amount),
            date: tx.date,
            card_id: tx.card_id ? parseInt(tx.card_id) : null,
            category_id: tx.category_id ? parseInt(tx.category_id) : null,
            timeframe: "Once"
        };
    });

    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert(preparedRecords)
            .select();

        if (error) throw error;

        res.status(201).json({ 
            message: 'Success!!! Bulk records inserted.', 
            count: data.length 
        });
    }
    catch (error) {
        console.error('Mass database insertion failure:', error.message || error);
        res.status(500).json({ error: error.message || 'Internal server error executing bulk translation insert.' });
    }
});

module.exports = router;

