import express from 'express';
import pool from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        
        let query;
        let values;
        
        if (searchQuery) {
            query = `
                SELECT 
                    p.id, p.price, p.trend_score, p.category, p.description, 
                    p.product_code, p.external_id, p.name, p.brand,
                    COALESCE(pi.url, p.image_url) AS image_url
                FROM products p
                LEFT JOIN product_images pi ON p.id::text = pi.product_id::text AND pi.is_main = true
                WHERE p.name ILIKE $1 OR p.description ILIKE $1 
                ORDER BY p.id DESC LIMIT 50
            `;
            values = [`%${searchQuery}%`];
        } else {
            query = `
                SELECT 
                    p.id, p.price, p.trend_score, p.category, p.description, 
                    p.product_code, p.external_id, p.name, p.brand,
                    COALESCE(pi.url, p.image_url) AS image_url
                FROM products p
                LEFT JOIN product_images pi ON p.id::text = pi.product_id::text AND pi.is_main = true
                ORDER BY p.id DESC LIMIT 50
            `;
            values = [];
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
