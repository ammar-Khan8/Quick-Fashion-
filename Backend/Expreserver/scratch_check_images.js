import './index.js';
import pool from './db/postgres.js';

async function check() {
  const data = await pool.query("SELECT * FROM product_images LIMIT 5");
  console.log("Images:", data.rows);
  process.exit();
}
check();
