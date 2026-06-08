import express from 'express';
import pool from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const category    = req.query.category || '';
        const page        = Math.max(1, parseInt(req.query.page) || 1);
        const limit       = Math.min(100, Math.max(1, parseInt(req.query.limit) || 40));
        const offset      = (page - 1) * limit; //this is using offset pagination.
        //ideally we use cursor based pagination

        let whereClause = '';
        let values      = [];
        let paramIndex  = 1;

        if (searchQuery) {
            whereClause = `WHERE (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
            values.push(`%${searchQuery}%`);
            paramIndex++;
        } else if (category) {
            whereClause = `WHERE p.category ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        const baseFrom = `FROM products p ${whereClause}`;

        // Total count for pagination metadata
        const countResult = await pool.query(
            `SELECT COUNT(*) ${baseFrom}`,
            values
        );
        const total      = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        // Paginated data — image_url is directly on products
        const dataResult = await pool.query(
            `SELECT
                p.id, p.price, p.trend_score, p.category, p.description,
                p.product_code, p.external_id, p.name, p.brand,
                p.image_url
            ${baseFrom}
            ORDER BY p.trend_score DESC NULLS LAST, p.id DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...values, limit, offset]
        );

        res.json({
            products:   dataResult.rows,
            total,
            page,
            totalPages,
            limit,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
