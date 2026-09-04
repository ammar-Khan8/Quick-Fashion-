import express from 'express';
import pool from '../db/postgres.js';

const router = express.Router();

// Temporary admin endpoint — returns ALL products (no limit cap)
// Used for the gender/category review page
router.get('/products', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, name, category, gender, image_url
             FROM products
             ORDER BY category ASC, name ASC`
        );
        res.json({ products: rows, total: rows.length });
    } catch (error) {
        console.error('Admin products error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
