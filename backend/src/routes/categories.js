const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// @route   POST /api/categories
// @desc    Create a new custom category
router.post('/', async (req, res) => {
    const { name, type, color, icon, budget_limit } = req.body;
    const userId = req.user.id;
    const normalizedType = typeof type === 'string' ? type.trim().toLowerCase() : '';

    if (!name || !normalizedType) {
        return res.status(400).json({ error: 'Category name and type are required.' });
    }

    if (!['expense', 'income'].includes(normalizedType)) {
        return res.status(400).json({ error: 'Type must be either expense or income.' });
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ 
                user_id: userId, 
                name, 
                type: normalizedType,
                color,
                icon,
                budget_limit
            }])
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'A category with that name already exists!' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Category added!', category: data[0] });
    } catch (error) {
        console.error('Category creation error:', error);
        res.status(500).json({ error: 'Internal server error saving category.' });
    }
});

// @route   GET /api/categories
// @desc    Fetch all categories for the logged-in user
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', req.user.id)
            .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to retrieve categories.' });
    }
});

module.exports = router;