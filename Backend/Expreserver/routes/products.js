import express from 'express';
import pool from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const category    = req.query.category || '';
        const gender      = req.query.gender || '';   // 'men' | 'women' | 'kids'
        const size        = req.query.size || '';
        const minRating   = parseFloat(req.query.minRating) || 0;
        const minPrice    = parseInt(req.query.minPrice) || 0;
        const maxPrice    = parseInt(req.query.maxPrice) || null; // null = no upper limit
        const page        = Math.max(1, parseInt(req.query.page) || 1);
        const limit       = Math.min(100, Math.max(1, parseInt(req.query.limit) || 40));
        const offset      = (page - 1) * limit; //this is using offset pagination.

        const conditions = [];
        const values     = [];
        let paramIndex   = 1;

        // Size filter JOIN
        let sizeJoin = '';
        if (size) {
            sizeJoin = ` JOIN product_variants pv ON p.id = pv.product_id`;
            conditions.push(`pv.size_value ILIKE $${paramIndex} AND COALESCE(pv.stock, 1) > 0`);
            values.push(size);
            paramIndex++;
        }

        // Rating filter JOIN
        let ratingJoin = '';
        if (minRating > 0) {
            ratingJoin = ` JOIN (
                SELECT product_id, AVG(rating) as avg_rating
                FROM reviews
                GROUP BY product_id
                HAVING AVG(rating) >= $${paramIndex}
            ) r ON p.id = r.product_id`;
            values.push(minRating);
            paramIndex++;
        }

        if (searchQuery) {
            conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
            values.push(`%${searchQuery}%`);
            paramIndex++;
        }

        if (category) {
            conditions.push(`p.category ILIKE $${paramIndex}`);
            values.push(`%${category}%`);
            paramIndex++;
        }

        // Exact gender match
        if (gender) {
            conditions.push(`p.gender = $${paramIndex}`);
            values.push(gender);
            paramIndex++;
        }

        // Price range
        if (minPrice > 0) {
            conditions.push(`p.price >= $${paramIndex}`);
            values.push(minPrice);
            paramIndex++;
        }
        if (maxPrice !== null) {
            conditions.push(`p.price <= $${paramIndex}`);
            values.push(maxPrice);
            paramIndex++;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Count query without unnecessary metadata LEFT JOIN
        const countFrom = `FROM products p ${sizeJoin} ${ratingJoin} ${whereClause}`;

        // Total count for pagination metadata
        const countResult = await pool.query(
            `SELECT COUNT(DISTINCT p.id) ${countFrom}`,
            values
        );
        const total      = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        // Metadata JOIN for reviews (must come BEFORE WHERE clause)
        const reviewsMetaJoin = `
            LEFT JOIN (
                SELECT product_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(id) AS review_count
                FROM reviews
                GROUP BY product_id
            ) rev ON p.id = rev.product_id
        `;
        const dataFrom = `FROM products p ${sizeJoin} ${ratingJoin} ${reviewsMetaJoin} ${whereClause}`;

        // Paginated data with aggregated ratings from reviews table
        const dataResult = await pool.query(
            `SELECT DISTINCT
                p.id, p.price, p.trend_score, p.category, p.description,
                p.product_code, p.external_id, p.name, p.brand,
                p.image_url, p.gender,
                COALESCE(rev.avg_rating, 4.2) AS rating,
                COALESCE(rev.review_count, 12) AS rating_count
            ${dataFrom}
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

// GET /api/products/:id — Fetch single product details with variants & reviews
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productResult = await pool.query(`
            SELECT 
                p.id, p.price, p.trend_score, p.category, p.description,
                p.product_code, p.external_id, p.name, p.brand,
                p.image_url, p.gender,
                COALESCE(rev.avg_rating, 4.2) AS rating,
                COALESCE(rev.review_count, 12) AS rating_count
            FROM products p
            LEFT JOIN (
                SELECT product_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(id) AS review_count
                FROM reviews
                GROUP BY product_id
            ) rev ON p.id = rev.product_id
            WHERE p.id = $1
        `, [id]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = productResult.rows[0];

        // Fetch available size variants
        const variantsResult = await pool.query(`
            SELECT id, size_value, stock 
            FROM product_variants 
            WHERE product_id = $1
            ORDER BY id ASC
        `, [id]);

        // Fetch product reviews
        const reviewsResult = await pool.query(`
            SELECT r.id, r.rating, r.comment, r.created_at, COALESCE(u.name, 'Verified Buyer') as reviewer_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY r.created_at DESC
            LIMIT 10
        `, [id]);

        res.json({
            product,
            variants: variantsResult.rows,
            reviews: reviewsResult.rows,
        });
    } catch (error) {
        console.error('Error fetching product by id:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
