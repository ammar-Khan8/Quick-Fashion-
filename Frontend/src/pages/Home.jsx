import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

// ─── Slide config ────────────────────────────────────────────────────────────
// Each slide knows its banner image, what to fetch, and where Explore links
const SLIDES = [
  {
    id: 'adidas',
    image: '/adidas_banner.jpg',
    label: 'Adidas — Trousers',
    isPortrait: true,
    fetchParams: { category: 'Trousers', limit: 12 },
    exploreLink: '/browse?category=Trousers',
    accentColor: '#e63946',
  },
  {
    id: 'hm',
    image: '/hm_banner.jpg',
    label: 'H&M — T-Shirts',
    isPortrait: true,
    fetchParams: { category: 'T-shirt', limit: 12 },
    exploreLink: '/browse?category=T-shirt',
    accentColor: '#c1121f',
  },
  {
    id: 'grand',
    image: '/grand_sale_banner.jpg',
    label: 'Grand Sale — All Styles',
    isPortrait: false,
    fetchParams: { limit: 15 },
    exploreLink: '/browse',
    accentColor: '#e63946',
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saleProducts, setSaleProducts] = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [gridKey, setGridKey] = useState(0); // bumped on slide change to re-trigger grid animation
  const intervalRef = useRef(null);

  // Scroll fade-in refs
  const [saleRef, saleInView] = useInView();
  const [arrivalsRef, arrivalsInView] = useInView();

  // ─── Auto-rotate carousel ──────────────────────────────────────────────────
  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
  };

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (idx) => {
    setCurrentIndex(idx);
    startInterval(); // reset timer on manual nav
  };
  const prev = () => goTo((currentIndex - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((currentIndex + 1) % SLIDES.length);

  // ─── Fetch sale products whenever slide changes ────────────────────────────
  useEffect(() => {
    const slide = SLIDES[currentIndex];
    setSaleLoading(true);
    setSaleProducts([]);
    setGridKey((k) => k + 1); // reset grid fade animation

    const params = new URLSearchParams();
    if (slide.fetchParams.category) params.set('category', slide.fetchParams.category);
    params.set('limit', slide.fetchParams.limit);
    params.set('page', 1);

    fetch(`http://localhost:3000/api/products?${params}`)
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
  }, [currentIndex]);

  // ─── Fetch new arrivals (unchanged) ───────────────────────────────────────
  useEffect(() => {
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
      .catch(() => {});
  }, []);

  const activeSlide = SLIDES[currentIndex];

  return (
    <div className="home-container">

      {/* ── Hero Carousel ──────────────────────────────────────────────────── */}
      <section className="hero-section">
        {/* Slides */}
        <div className="carousel-track">
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`carousel-slide ${idx === currentIndex ? 'active' : ''} ${slide.isPortrait ? 'portrait' : 'landscape'}`}
            >
              <img
                src={slide.image}
                alt={slide.label}
                className="carousel-img"
                draggable={false}
              />
              {/* Explore pill */}
              <Link
                to={slide.exploreLink}
                className="explore-btn"
                style={{ '--accent': slide.accentColor }}
              >
                Explore →
              </Link>
            </div>
          ))}
        </div>

        {/* Nav arrows */}
        <button className="carousel-arrow carousel-arrow--left" onClick={prev} aria-label="Previous">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <button className="carousel-arrow carousel-arrow--right" onClick={next} aria-label="Next">
          <ChevronRight size={22} strokeWidth={2} />
        </button>

        {/* Dots */}
        <div className="carousel-dots">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Go to ${slide.label}`}
            />
          ))}
        </div>
      </section>

      {/* ── Sale Products ──────────────────────────────────────────────────── */}
      <section ref={saleRef} className={`sale-section fade-in-up ${saleInView ? 'visible' : ''}`}>
        <div className="sale-header">
          <h2 className="sale-title">{activeSlide.label}</h2>
          <Link to={activeSlide.exploreLink} className="sale-see-all">
            See all →
          </Link>
        </div>

        {saleLoading ? (
          <div className="sale-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="sale-skeleton" />
            ))}
          </div>
        ) : (
          <div key={gridKey} className="sale-grid grid-fade-in">
            {saleProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="sale-card">
                <div className="sale-card-img-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                </div>
                <div className="sale-card-info">
                  <span className="sale-card-name">{product.name}</span>
                  <span className="sale-card-price">{product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── New Arrivals ───────────────────────────────────────────────── */}
      <section ref={arrivalsRef} className={`featured-section fade-in-up ${arrivalsInView ? 'visible' : ''}`}>
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="featured-grid">
          {newArrivals.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1550614000-4b95d4eb952c?q=80&w=600&auto=format&fit=crop';
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
