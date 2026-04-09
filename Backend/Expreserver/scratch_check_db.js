import './index.js';
import pool from './db/postgres.js';

async function check() {
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log("Tables:", tables.rows);
  const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
  console.log("Columns in 'products':", columns.rows);
  const data = await pool.query("SELECT * FROM products LIMIT 1");
  console.log("First product:", data.rows[0]);
  process.exit();
}
check();
