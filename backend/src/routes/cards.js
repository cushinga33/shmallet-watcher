const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.post('/', async (req, res) => {
    const { name, last_four, card_limit } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ error: 'Card name is required.' });
    }

    const trimmedName = name.trim();
    const normalizedLastFour = typeof last_four === 'string' ? last_four.trim() : '';
    const parsedLimit = card_limit === null || card_limit === undefined || card_limit === ''
        ? null
        : Number(card_limit);

    if (!trimmedName) {
        return res.status(400).json({ error: 'Card name is required.' });
    }

    if (normalizedLastFour && !/^\d{4}$/.test(normalizedLastFour)) {
        return res.status(400).json({ error: 'Last four digits must contain exactly 4 numbers.' });
    }

    if (parsedLimit !== null && Number.isNaN(parsedLimit)) {
        return res.status(400).json({ error: 'Card limit must be a valid number.' });
    }

    try {
        const { data, error } = await supabase
            .from('cards')
            .insert([{ 
                user_id: userId,
                name: trimmedName,
                last_four: normalizedLastFour || null,
                card_limit: parsedLimit,
            }])
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'A card with that name already exists!' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Card added!', card: data[0] });
    } catch (error) {
        console.error('Card creation error:', error);
        res.status(500).json({ error: 'Internal server error saving card.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', req.user.id)
            .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Failed to retrieve cards.' });
    }
});

module.exports = router;
