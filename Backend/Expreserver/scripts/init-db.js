import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    console.log("Connecting to Supabase...");
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("Creating tables...");
    await pool.query(schemaSql);
    console.log("✅ Tables created successfully!");
    
    console.log("\nYou should now run 'node scripts/seed.js' to populate the dummy data.");
  } catch (err) {
    console.error("❌ Database Error:", err.message);
  } finally {
    pool.end();
  }
}

initDatabase();
