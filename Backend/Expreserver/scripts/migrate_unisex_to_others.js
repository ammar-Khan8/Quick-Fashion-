import 'dotenv/config';
import pool from '../db/postgres.js';

async function migrateUnisexToOthers() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to Supabase DB\n');

    // ── 1. Show all distinct categories in the products table ─────────────────
    console.log('📋 Distinct categories in products table:');
    const catResult = await client.query(`
      SELECT category, COUNT(*) as count
      FROM products
      GROUP BY category
      ORDER BY count DESC
    `);
    console.table(catResult.rows);

    // ── 2. Show gender breakdown ───────────────────────────────────────────────
    console.log('\n📊 Gender breakdown in products table:');
    const genderResult = await client.query(`
      SELECT gender, COUNT(*) as count
      FROM products
      GROUP BY gender
      ORDER BY count DESC
    `);
    console.table(genderResult.rows);

    // ── 3. Create the "others" table (same structure as products) ─────────────
    console.log('\n🏗️  Creating "others" table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS others (
        id            INTEGER PRIMARY KEY,
        name          TEXT,
        brand         TEXT,
        category      TEXT,
        description   TEXT,
        price         NUMERIC,
        trend_score   INTEGER,
        product_code  TEXT,
        external_id   TEXT,
        image_url     TEXT,
        gender        TEXT
      )
    `);
    console.log('   ✅ "others" table ready\n');

    // ── 4. Copy all unisex products from products → others ────────────────────
    console.log('📦 Copying unisex products into "others"...');
    const insertResult = await client.query(`
      INSERT INTO others (id, name, brand, category, description, price, trend_score, product_code, external_id, image_url, gender)
      SELECT id, name, brand, category, description, price, trend_score, product_code, external_id, image_url, gender
      FROM products
      WHERE gender = 'unisex'
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   ✅ Inserted ${insertResult.rowCount} unisex products into "others"\n`);

    // ── 5. Remove unisex products from products table ─────────────────────────
    console.log('🗑️  Removing unisex products from "products" table...');
    const deleteResult = await client.query(`
      DELETE FROM products WHERE gender = 'unisex'
    `);
    console.log(`   ✅ Removed ${deleteResult.rowCount} unisex products from "products"\n`);

    // ── 6. Verify final state ─────────────────────────────────────────────────
    console.log('✅ Final gender breakdown in "products":');
    const finalGender = await client.query(`
      SELECT gender, COUNT(*) as count FROM products GROUP BY gender ORDER BY count DESC
    `);
    console.table(finalGender.rows);

    console.log('\n✅ Products in "others" table:');
    const othersCount = await client.query(`SELECT COUNT(*) as count FROM others`);
    console.log(`   ${othersCount.rows[0].count} products in "others"`);

    console.log('\n✅ Distinct categories left in "products" (for filter validation):');
    const finalCats = await client.query(`
      SELECT category, COUNT(*) as count
      FROM products
      GROUP BY category
      ORDER BY count DESC
    `);
    console.table(finalCats.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateUnisexToOthers();
