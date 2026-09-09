import '../index.js'; // Ensure dotenv is loaded
import pool from '../db/postgres.js';

// Mapping of image URLs to realistic Zara-style clothing items
const REALISTIC_PRODUCTS = {
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop": {
    name: "PLEATED MIDI SKIRT",
    price: 3590,
    category: "woman"
  },
  "https://images.unsplash.com/photo-1434389678369-ce4ff0e68d01?w=600&auto=format&fit=crop": {
    name: "LINEN BLEND BLAZER",
    price: 5990,
    category: "woman"
  },
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop": {
    name: "TEXTURED KNIT CARDIGAN",
    price: 2990,
    category: "woman"
  },
  "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&auto=format&fit=crop": {
    name: "OVERSIZED WOOL COAT",
    price: 12900,
    category: "woman"
  },
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop": {
    name: "LEATHER LOAFERS",
    price: 4990,
    category: "shoes"
  },
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop": {
    name: "FAUX LEATHER BIKER JACKET",
    price: 4590,
    category: "woman"
  },
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop": {
    name: "PUFFY QUILTED JACKET",
    price: 3990,
    category: "man"
  },
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop": {
    name: "BASIC CREWNECK T-SHIRT",
    price: 1290,
    category: "man"
  },
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop": {
    name: "CHUNKY SOLE SNEAKERS",
    price: 5590,
    category: "shoes"
  },
  "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&auto=format&fit=crop": {
    name: "STRAIGHT FIT JEANS",
    price: 2590,
    category: "man"
  },
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop": {
    name: "SEQUINED EVENING DRESS",
    price: 6990,
    category: "woman"
  },
  "https://images.unsplash.com/photo-1475179604610-749315332f17?w=600&auto=format&fit=crop": {
    name: "TAILORED WIDE LEG TROUSERS",
    price: 3990,
    category: "woman"
  }
};

async function makeProductsRealistic() {
  try {
    console.log("Updating all fake products to realistic Zara-style items...");
    let count = 0;
    
    // For every image we seeded, update the database rows that have that image
    // to match the correct name and price of that specific item.
    for (const [imageUrl, itemData] of Object.entries(REALISTIC_PRODUCTS)) {
      const result = await pool.query(
        'UPDATE products SET name = $1, price = $2, category = $3 WHERE image_url = $4',
        [itemData.name, itemData.price, itemData.category, imageUrl]
      );
      count += result.rowCount;
      console.log(`Updated ${result.rowCount} items to be "${itemData.name}"`);
    }

    console.log(`✅ Successfully made ${count} products highly realistic!`);
  } catch (error) {
    console.error("Error updating names and prices:", error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

makeProductsRealistic();
