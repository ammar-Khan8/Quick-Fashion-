import 'dotenv/config';
import pool from '../db/postgres.js';

// ─── Category → gender rules ────────────────────────────────────────────────
// Based on confirmed mapping from user
const WOMEN_CATEGORIES = new Set([
  'dress', 'blouse', 'saree', 'kurti', 'skirt',
  'leggings', 'jumpsuit', 'tracksuit', 'top',
]);

// Everything else (hoodie, coat, tshirt, t-shirt, shirt, trousers,
// jacket, sweater, shorts, jeans, suit, other) → 'unisex'

// ─── Name keyword overrides ──────────────────────────────────────────────────
// Checked in order. "women" must be before "men" to avoid false match.
const NAME_RULES = [
  { keywords: ['women', 'woman', 'ladies', 'lady', 'female', 'girls', 'girl'], gender: 'women' },
  { keywords: ['\\bmen\\b', '\\bman\\b', 'male', '\\bboys\\b', '\\bboy\\b', 'gents'], gender: 'men' },
  { keywords: ['kids', 'children', 'child', 'junior', 'toddler', 'infant', 'baby'], gender: 'kids' },
];

function genderFromName(name) {
  const lower = name.toLowerCase();
  for (const rule of NAME_RULES) {
    for (const kw of rule.keywords) {
      const re = new RegExp(kw, 'i');
      if (re.test(lower)) return rule.gender;
    }
  }
  return null; // no match → fall back to category rule
}

function genderFromCategory(category) {
  if (!category) return 'unisex';
  return WOMEN_CATEGORIES.has(category.toLowerCase().trim()) ? 'women' : 'unisex';
}

async function addGenderColumn() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to Supabase DB\n');

    // ── 1. Add column if it doesn't already exist ──────────────────────────
    console.log('📐 Adding gender column...');
    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS gender TEXT
      CHECK (gender IN ('men', 'women', 'unisex', 'kids'))
    `);
    console.log('   ✅ gender column added (or already existed)\n');

    // ── 2. Fetch all products ──────────────────────────────────────────────
    const { rows: products } = await client.query(
      'SELECT id, name, category FROM products'
    );
    console.log(`📦 Found ${products.length} products to process\n`);

    // ── 3. Assign gender ───────────────────────────────────────────────────
    const counts = { men: 0, women: 0, unisex: 0, kids: 0 };
    const updates = products.map((p) => {
      const fromName = genderFromName(p.name);
      const gender   = fromName ?? genderFromCategory(p.category);
      counts[gender]++;
      return { id: p.id, gender, name: p.name, category: p.category, source: fromName ? 'name' : 'category' };
    });

    // ── 4. Batch update in one transaction ────────────────────────────────
    await client.query('BEGIN');
    for (const u of updates) {
      await client.query('UPDATE products SET gender = $1 WHERE id = $2', [u.gender, u.id]);
    }
    await client.query('COMMIT');

    // ── 5. Summary ────────────────────────────────────────────────────────
    console.log('🎉 Gender assignment complete!\n');
    console.log('📊 Breakdown:');
    console.log(`   women  : ${counts.women}`);
    console.log(`   men    : ${counts.men}`);
    console.log(`   unisex : ${counts.unisex}`);
    console.log(`   kids   : ${counts.kids}`);
    console.log('');

    // ── 6. Show a sample so you can sanity-check ──────────────────────────
    console.log('🔍 Sample rows (15):');
    const sample = await client.query(
      'SELECT id, name, category, gender FROM products ORDER BY RANDOM() LIMIT 15'
    );
    console.table(sample.rows);

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error — rolled back transaction:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addGenderColumn();
