import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1434389678369-184bf3f43eb7?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2000&auto=format&fit=crop"
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Background poster carousel logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // Rotates every 6 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Grab the top 4 items for the new arrivals layout
        const formattedData = data.slice(0, 4).map((p, i) => ({
          ...p,
          image: p.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop&random=${p.id || i}`,
          price: `₹ ${Number(p.price).toFixed(2)}`
        }));
        setProducts(formattedData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        {HERO_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`animated-poster-layer ${index === currentHeroIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url('${img}')` }}
          ></div>
        ))}
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">SPRING SUMMER</h1>
          <div className="hero-actions">
            <Link to="/browse" className="btn-primary">DISCOVER</Link>
          </div>
        </div>
      </section>

      {/* Categories/Trending Section */}
      <section className="trending-section">
        <div className="grid-split">
          <Link to="/browse?category=woman" className="split-item">
            <img 
              src="https://images.unsplash.com/photo-1434389678369-184bf3f43eb7?q=80&w=1000&auto=format&fit=crop" 
              alt="Woman Category" 
            />
            <div className="split-text">WOMAN</div>
          </Link>
          <Link to="/browse?category=man" className="split-item">
            <img 
              src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop" 
              alt="Man Category" 
            />
            <div className="split-text">MAN</div>
          </Link>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="featured-section">
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="featured-grid">
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1550614000-4b95d4eb952c?q=80&w=600&auto=format&fit=crop";
                  }}
                />
              </div>
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="product-price">{product.price}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="view-all-container">
          <Link to="/browse" className="btn-secondary">VIEW ALL</Link>
        </div>
      </section>
    </div>
  );
}
