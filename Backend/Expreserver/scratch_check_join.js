import './index.js';
import pool from './db/postgres.js';

async function check() {
  try {
    const data = await pool.query(`
      SELECT p.id, COALESCE(pi.url, p.image_url) AS image_url, pi.url as pi_url 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id::int AND pi.is_main = true 
      WHERE p.id = 502
    `);
    console.log("Joined products:", data.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
check();
