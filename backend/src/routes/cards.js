const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

const DEFAULT_CARD_COLOR = '#4aba68';
const DEFAULT_CARD_ICON = 'CreditCard';

router.post('/', async (req, res) => {
    const { name, last_four, card_limit, color, icon } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ error: 'Card name is required.' });
    }

    const trimmedName = name.trim();
    const normalizedLastFour = typeof last_four === 'string' ? last_four.trim() : '';
    const parsedLimit = card_limit === null || card_limit === undefined || card_limit === ''
        ? null
        : Number(card_limit);
    const normalizedColor = typeof color === 'string' && color.trim() ? color.trim() : DEFAULT_CARD_COLOR;
    const normalizedIcon = typeof icon === 'string' && icon.trim() ? icon.trim() : DEFAULT_CARD_ICON;

    if (!trimmedName) {
        return res.status(400).json({ error: 'Card name is required.' });
    }

    if (normalizedLastFour && !/^\d{4}$/.test(normalizedLastFour)) {
        return res.status(400).json({ error: 'Last four digits must contain exactly 4 numbers.' });
    }

    if (parsedLimit !== null && Number.isNaN(parsedLimit)) {
        return res.status(400).json({ error: 'Card limit must be a valid number.' });
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(normalizedColor)) {
        return res.status(400).json({ error: 'Card color must be a valid hex color.' });
    }

    try {
        const { data, error } = await supabase
            .from('cards')
            .insert([{ 
                user_id: userId,
                name: trimmedName,
                last_four: normalizedLastFour || null,
                card_limit: parsedLimit,
                color: normalizedColor,
                icon: normalizedIcon,
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
    const includeArchived = req.query.include_archived === 'true';

    try {
        let query = supabase
            .from('cards')
            .select('*')
            .eq('user_id', req.user.id)
            .order('name', { ascending: true });

        if (!includeArchived) {
            query = query.or('is_archived.is.false,is_archived.is.null');
        }

        const { data, error } = await query;

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Failed to retrieve cards.' });
    }
});

router.put('/:id', async (req, res) => {
    const { name, last_four, card_limit, color, icon } = req.body;
    const userId = req.user.id;
    const cardId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(cardId) || cardId <= 0) {
        return res.status(400).json({ error: 'Invalid card id.' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Card name is required.' });
    }

    const trimmedName = name.trim();
    const normalizedLastFour = typeof last_four === 'string' ? last_four.trim() : '';
    const parsedLimit = card_limit === null || card_limit === undefined || card_limit === ''
        ? null
        : Number(card_limit);
    const normalizedColor = typeof color === 'string' && color.trim() ? color.trim() : DEFAULT_CARD_COLOR;
    const normalizedIcon = typeof icon === 'string' && icon.trim() ? icon.trim() : DEFAULT_CARD_ICON;

    if (!trimmedName) {
        return res.status(400).json({ error: 'Card name is required.' });
    }

    if (normalizedLastFour && !/^\d{4}$/.test(normalizedLastFour)) {
        return res.status(400).json({ error: 'Last four digits must contain exactly 4 numbers.' });
    }

    if (parsedLimit !== null && Number.isNaN(parsedLimit)) {
        return res.status(400).json({ error: 'Card limit must be a valid number.' });
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(normalizedColor)) {
        return res.status(400).json({ error: 'Card color must be a valid hex color.' });
    }

    try {
        const { data, error } = await supabase
            .from('cards')
            .update({
                name: trimmedName,
                last_four: normalizedLastFour || null,
                card_limit: parsedLimit,
                color: normalizedColor,
                icon: normalizedIcon,
            })
            .eq('id', cardId)
            .eq('user_id', userId)
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'A card with that name already exists!' });
            }
            throw error;
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        res.status(200).json({ message: 'Card updated.', card: data[0] });
    } catch (error) {
        console.error('Card update error:', error);
        res.status(500).json({ error: 'Internal server error updating card.' });
    }
});

router.put('/:id/archive', async (req, res) => {
    const userId = req.user.id;
    const cardId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(cardId) || cardId <= 0) {
        return res.status(400).json({ error: 'Invalid card id.' });
    }

    try {
        const { data, error } = await supabase
            .from('cards')
            .update({
                is_archived: true,
                archived_at: new Date().toISOString(),
            })
            .eq('id', cardId)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        res.status(200).json({ message: 'Card archived.', card: data[0] });
    } catch (error) {
        console.error('Card archive error:', error);
        res.status(500).json({ error: 'Internal server error archiving card.' });
    }
});

router.put('/:id/unarchive', async (req, res) => {
    const userId = req.user.id;
    const cardId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(cardId) || cardId <= 0) {
        return res.status(400).json({ error: 'Invalid card id.' });
    }

    try {
        const { data, error } = await supabase
            .from('cards')
            .update({
                is_archived: false,
                archived_at: null,
            })
            .eq('id', cardId)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        res.status(200).json({ message: 'Card unarchived.', card: data[0] });
    } catch (error) {
        console.error('Card unarchive error:', error);
        res.status(500).json({ error: 'Internal server error unarchiving card.' });
    }
});

router.delete('/:id', async (req, res) => {
    const userId = req.user.id;
    const cardId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(cardId) || cardId <= 0) {
        return res.status(400).json({ error: 'Invalid card id.' });
    }

    try {
        const { count, error: countError } = await supabase
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('card_id', cardId);

        if (countError) throw countError;

        if ((count || 0) > 0) {
            return res.status(409).json({
                error: 'Card is in use by existing transactions. Archive instead.',
                code: 'CARD_IN_USE',
                transactionCount: count,
            });
        }

        const { data, error } = await supabase
            .from('cards')
            .delete()
            .eq('id', cardId)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        res.status(200).json({ message: 'Card deleted.', card: data[0] });
    } catch (error) {
        console.error('Card delete error:', error);
        res.status(500).json({ error: 'Internal server error deleting card.' });
    }
});

module.exports = router;
