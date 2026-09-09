import '../index.js'; // Ensure dotenv is loaded
import pool from '../db/postgres.js';

const FASHION_IMAGES = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1434389678369-ce4ff0e68d01?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475179604610-749315332f17?w=600&auto=format&fit=crop"
];

async function addImagesToExistingData() {
  try {
    console.log("Fetching ALL products to replace their images...");
    const result = await pool.query('SELECT id, category FROM products');
    
    let count = 0;
    for (const row of result.rows) {
      // Pick a random image from our curated fashion list
      const randomImage = FASHION_IMAGES[Math.floor(Math.random() * FASHION_IMAGES.length)];
      await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [randomImage, row.id]);
      count++;
    }

    console.log(`✅ Successfully updated ${count} products with genuine assorted fashion images!`);
  } catch (error) {
    console.error("Error updating images:", error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

addImagesToExistingData();
