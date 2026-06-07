const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.post('/', async (req, res) => {
    const { description, amount, date, card_id, category_id } = req.body;

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

router.get('/', async (req, res) => {
    const userId = req.user?.id;

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, category:categories(name), card:cards(name, last_four)')
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

module.exports = router;

