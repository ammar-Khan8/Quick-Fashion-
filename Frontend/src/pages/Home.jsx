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

// ─── Product categories — keyed by gender, matching actual DB categories ────────
const CATEGORIES_BY_GENDER = {
  women: [
    { id: 'Kurti',     label: 'Kurti',     image: null },
    { id: 'Dress',     label: 'Dress',     image: null },
    { id: 'Skirt',     label: 'Skirt',     image: null },
    { id: 'Top',       label: 'Top',       image: null },
    { id: 'Tracksuit', label: 'Tracksuit', image: null },
    { id: 'Blouse',    label: 'Blouse',    image: null },
    { id: 'Leggings',  label: 'Leggings',  image: null },
    { id: 'Jumpsuit',  label: 'Jumpsuit',  image: null },
    { id: 'Saree',     label: 'Saree',     image: null },
  ],
  men: [
    { id: 'Shirt',    label: 'Shirt',    image: null },
    { id: 'T-shirt',  label: 'T-Shirt',  image: null },
    { id: 'Jeans',    label: 'Jeans',    image: null },
    { id: 'Trousers', label: 'Trousers', image: null },
    { id: 'Hoodie',   label: 'Hoodie',   image: null },
    { id: 'Jacket',   label: 'Jacket',   image: null },
    { id: 'Coat',     label: 'Coat',     image: null },
    { id: 'Sweater',  label: 'Sweater',  image: null },
    { id: 'Shorts',   label: 'Shorts',   image: null },
  ],
};

export default function Home() {
  const [saleProducts, setSaleProducts] = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [activeGender, setActiveGender] = useState('women');

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

        {/* ── Gender Toggle ─────────────────────────────────────────────── */}
        <div className="gender-toggle">
          <button
            className={`gender-btn${activeGender === 'women' ? ' gender-btn--active' : ''}`}
            onClick={() => setActiveGender('women')}
          >
            Women
          </button>
          <button
            className={`gender-btn${activeGender === 'men' ? ' gender-btn--active' : ''}`}
            onClick={() => setActiveGender('men')}
          >
            Men
          </button>
        </div>

        {/* ── Product-type filter grid ───────────────────────────────────── */}
        <div className="cat-filter-grid">
          {(CATEGORIES_BY_GENDER[activeGender] || []).map((cat) => (
            <Link
              key={cat.id}
              to={`/browse?gender=${activeGender}&category=${cat.id}`}
              className="cat-filter-card"
            >
              <div className="cat-filter-img">
                {cat.image
                  ? <img src={cat.image} alt={cat.label} className="cat-filter-photo" />
                  : <div className="cat-filter-placeholder" />}
                <div className="cat-overlay-accent"></div>
                <div className="cat-filter-arrow">→</div>
              </div>
              <div className="cat-filter-label">{cat.label}</div>
            </Link>
          ))}
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
      {/* ── Temporary admin shortcut ───────────────────────────────────────── */}
      <Link
        to="/admin/products"
        title="Admin: review product genders"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 999,
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          letterSpacing: '0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        🗂️ Gender Review
      </Link>
    </div>
  );
}
