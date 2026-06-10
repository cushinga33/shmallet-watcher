const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// @route   POST /api/categories
// @desc    Create a new custom category
router.post('/', async (req, res) => {
    const { name, type, color, icon, budget_limit, timeframe} = req.body;
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
                budget_limit,
                timeframe
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
    const includeArchived = req.query.include_archived === 'true';

    try {
        let query = supabase
            .from('categories')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: true});

        if (!includeArchived) {
            query = query.or('is_archived.is.false,is_archived.is.null');
        }

        const { data, error } = await query;

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to retrieve categories.' });
    }
});

// @route   PUT /api/categories/:id/archive
// @desc    Archive a category for the logged-in user
router.put('/:id/archive', async (req, res) => {
    const userId = req.user.id;
    const categoryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({ error: 'Invalid category id.' });
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .update({
                is_archived: true,
                archived_at: new Date().toISOString(),
            })
            .eq('id', categoryId)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category archived.', category: data[0] });
    } catch (error) {
        console.error('Category archive error:', error);
        res.status(500).json({ error: 'Internal server error archiving category.' });
    }
});

// @route   PUT /api/categories/:id/unarchive
// @desc    Unarchive a category for the logged-in user
router.put('/:id/unarchive', async (req, res) => {
    const userId = req.user.id;
    const categoryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({ error: 'Invalid category id.' });
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .update({
                is_archived: false,
                archived_at: null,
            })
            .eq('id', categoryId)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category unarchived.', category: data[0] });
    } catch (error) {
        console.error('Category unarchive error:', error);
        res.status(500).json({ error: 'Internal server error unarchiving category.' });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category for the logged-in user
router.put('/:id', async (req, res) => {
    const userId = req.user.id;
    const categoryId = Number.parseInt(req.params.id, 10);
    const { name, type, color, icon, budget_limit, timeframe } = req.body;
    const normalizedType = typeof type === 'string' ? type.trim().toLowerCase() : '';

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({ error: 'Invalid category id.' });
    }

    if (!name || !normalizedType) {
        return res.status(400).json({ error: 'Category name and type are required.' });
    }

    if (!['expense', 'income'].includes(normalizedType)) {
        return res.status(400).json({ error: 'Type must be either expense or income.' });
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .update({
                name,
                type: normalizedType,
                color,
                icon,
                budget_limit,
                timeframe,
            })
            .eq('id', categoryId)
            .eq('user_id', userId)
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'A category with that name already exists!' });
            }
            throw error;
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category updated!', category: data[0] });
    } catch (error) {
        console.error('Category update error:', error);
        res.status(500).json({ error: 'Internal server error updating category.' });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category for the logged-in user
router.delete('/:id', async (req, res) => {
    const userId = req.user.id;
    const categoryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({ error: 'Invalid category id.' });
    }

    try {
        const { count, error: countError } = await supabase
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('category_id', categoryId);

        if (countError) throw countError;

        if ((count || 0) > 0) {
            return res.status(409).json({
                error: 'Category is in use by existing transactions. Archive instead.',
                code: 'CATEGORY_IN_USE',
                transactionCount: count,
            });
        }

        const { data, error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category deleted.', category: data[0] });
    } catch (error) {
        console.error('Category delete error:', error);
        res.status(500).json({ error: 'Internal server error deleting category.' });
    }
});

module.exports = router;