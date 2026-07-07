import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// ─── Scroll fade-in hook (bidirectional — fades in AND out) ───────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No disconnect — observer stays alive so exit is also tracked
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

export default function Home() {
  const [saleProducts, setSaleProducts] = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);

  // Scroll fade-in refs
  const [saleRef, saleInView] = useInView();
  const [arrivalsRef, arrivalsInView] = useInView();

  // ─── Fetch sale products ───────────────────────────────────────────────────
  useEffect(() => {
    setSaleLoading(true);
    setSaleProducts([]);

    fetch(`http://localhost:3000/api/products?limit=8&page=1`)
      .then((r) => r.json())
      .then((data) => {
        const items = (data.products || []).map((p) => ({
          ...p,
          image: p.image_url,
          price: `₹ ${Number(p.price).toLocaleString('en-IN')}`,
        }));
        setSaleProducts(items);
      })
      .catch(() => setSaleProducts([]))
      .finally(() => setSaleLoading(false));
  }, []);

  // ─── Fetch new arrivals ─────────────────────────────────────────────────────
  useEffect(() => {
    setNewArrivalsLoading(true);
    setNewArrivals([]);

    fetch('http://localhost:3000/api/products?limit=4&page=1')
      .then((r) => r.json())
      .then((data) => {
        const items = (data.products || []).map((p) => ({
          ...p,
          image: p.image_url,
          price: `₹ ${Number(p.price).toLocaleString('en-IN')}`,
        }));
        setNewArrivals(items);
      })
      .catch(() => setNewArrivals([]))
      .finally(() => setNewArrivalsLoading(false));
  }, []);

  return (
    <div className="home-container">

      {/* ── Zara-Inspired Hero Section ──────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-texture"></div>
          <div className="corner-mark"></div>
          <p className="hero-eyebrow">New Season — Spring / Summer Collection</p>
          <h1 className="hero-title">The<br /><em>Latest</em><br />Arrivals</h1>
          <div className="hero-cta">
            <Link to="/browse" className="btn-primary">Shop Now</Link>
            <Link to="/browse" className="btn-ghost">View Collection</Link>
          </div>
          <div className="hero-scroll">
            <div className="scroll-line"></div>
            <span>Scroll</span>
          </div>
        </div>
        <div className="hero-right">
          {/* Video placeholder — user can add video here */}
          <div className="video-placeholder">
            <div className="placeholder-content">
              <p>Your video goes here</p>
            </div>
          </div>
          <div className="hero-right-text">
            <p>SS26</p>
            <p>Collection</p>
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────────── */}
      <div className="marquee-bar">
        <div className="marquee-track">
          <span className="marquee-item">New Collection</span>
          <span className="marquee-item">Free Returns</span>
          <span className="marquee-item">SS26 Now Live</span>
          <span className="marquee-item">Pre-Owned</span>
          <span className="marquee-item">Ski Collection</span>
          <span className="marquee-item">Up to 70% Off</span>
          <span className="marquee-item">New Collection</span>
          <span className="marquee-item">Free Returns</span>
          <span className="marquee-item">SS26 Now Live</span>
          <span className="marquee-item">Pre-Owned</span>
          <span className="marquee-item">Ski Collection</span>
          <span className="marquee-item">Up to 70% Off</span>
        </div>
      </div>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="categories fade-in-up visible">
        <div className="section-header">
          <h2 className="section-title">Shop by<br /><em>Category</em></h2>
          <Link to="/browse" className="section-link">View All</Link>
        </div>
        <div className="cat-grid">
          {/* Woman - large */}
          <Link to="/browse?category=woman" className="cat-card">
            <div className="cat-overlay-accent"></div>
            <div className="cat-bg cat-woman" style={{ height: '100%' }}>
              <div className="cat-abstract">
                <svg width="200" height="300" viewBox="0 0 200 300" fill="none">
                  <ellipse cx="100" cy="80" rx="50" ry="60" stroke="white" strokeWidth="1" />
                  <rect x="60" y="130" width="80" height="140" stroke="white" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div className="cat-info">
              <div>
                <div className="cat-name">Woman</div>
                <div className="cat-count">1,240 pieces</div>
              </div>
            </div>
            <div className="cat-arrow">→</div>
          </Link>
          {/* Man */}
          <Link to="/browse?category=man" className="cat-card">
            <div className="cat-overlay-accent"></div>
            <div className="cat-bg cat-man" style={{ height: '100%' }}>
              <div className="cat-abstract">
                <svg width="140" height="200" viewBox="0 0 140 200" fill="none">
                  <rect x="30" y="10" width="80" height="180" stroke="white" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div className="cat-info">
              <div>
                <div className="cat-name">Man</div>
                <div className="cat-count">840 pieces</div>
              </div>
            </div>
            <div className="cat-arrow">→</div>
          </Link>
          {/* Kids */}
          <Link to="/browse?category=kids" className="cat-card">
            <div className="cat-overlay-accent"></div>
            <div className="cat-bg cat-kids" style={{ height: '100%' }}>
              <div className="cat-abstract">
                <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
                  <circle cx="60" cy="40" r="30" stroke="#2a2520" strokeWidth="1" />
                  <rect x="25" y="70" width="70" height="80" stroke="#2a2520" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div className="cat-info">
              <div>
                <div className="cat-name">Kids</div>
                <div className="cat-count">620 pieces</div>
              </div>
            </div>
            <div className="cat-arrow">→</div>
          </Link>
          {/* Home */}
          <Link to="/browse?category=home" className="cat-card">
            <div className="cat-overlay-accent"></div>
            <div className="cat-bg cat-home" style={{ height: '100%' }}>
              <div className="cat-abstract">
                <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
                  <polygon points="70,10 10,50 130,50" stroke="white" strokeWidth="1" />
                  <rect x="35" y="50" width="70" height="40" stroke="white" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div className="cat-info">
              <div>
                <div className="cat-name">Home</div>
                <div className="cat-count">380 pieces</div>
              </div>
            </div>
            <div className="cat-arrow">→</div>
          </Link>
          {/* Beauty */}
          <Link to="/browse?category=beauty" className="cat-card">
            <div className="cat-overlay-accent"></div>
            <div className="cat-bg cat-beauty" style={{ height: '100%' }}>
              <div className="cat-abstract">
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                  <circle cx="60" cy="50" r="40" stroke="#3a3028" strokeWidth="1" />
                  <circle cx="60" cy="50" r="20" stroke="#3a3028" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div className="cat-info" style={{ background: 'linear-gradient(to top, rgba(58,48,40,0.5) 0%, transparent 100%)' }}>
              <div>
                <div className="cat-name" style={{ color: 'var(--text)' }}>Beauty</div>
                <div className="cat-count" style={{ color: '#888' }}>290 pieces</div>
              </div>
            </div>
            <div className="cat-arrow" style={{ borderColor: 'rgba(0,0,0,0.2)', color: 'var(--text)' }}>→</div>
          </Link>
        </div>
      </section>

      {/* ── New Arrivals ───────────────────────────────────────────────── */}
      <section ref={arrivalsRef} className={`featured fade-in-up ${arrivalsInView ? 'visible' : ''}`}>
        <div className="section-header">
          <h2 className="section-title">New <em>Arrivals</em></h2>
          <Link to="/browse" className="section-link">See All</Link>
        </div>
        <div className="featured-grid">
          {newArrivalsLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div className="product-card product-card--placeholder" key={`new-arrivals-placeholder-${index}`}>
                  <div className="product-image product-image--placeholder" />
                  <div className="product-name product-name--placeholder" />
                  <div className="product-detail product-detail--placeholder" />
                  <div className="product-price product-price--placeholder" />
                </div>
              ))
            : newArrivals.slice(0, 4).map((product, i) => (
                <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                  <div className="product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-img-bg"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1550614000-4b95d4eb952c?q=80&w=600&auto=format&fit=crop';
                      }}
                    />
                    <div className="product-save">♡</div>
                    {i === 0 && <div className="product-tag">New</div>}
                    {i === 2 && <div className="product-tag" style={{ background: 'var(--black)' }}>Sale</div>}
                    <div className="product-quick">Quick Add</div>
                  </div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-detail">Available in store</div>
                  <div className="product-price">{product.price}</div>
                </Link>
              ))}
        </div>
      </section>
    </div>
  );
}
