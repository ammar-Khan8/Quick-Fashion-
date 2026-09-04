import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Product.css';

const Product = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [openAcc, setOpenAcc] = useState({ desc: true, reviews: false });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    fetch(`http://localhost:3000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        setProductData(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedSize(data.variants[0].size_value);
        }
      })
      .catch((err) => console.error('Error loading product:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="product-page" style={{ textAlign: 'center', padding: '120px 20px' }}>
        <p style={{ letterSpacing: '2px', fontSize: '12px', textTransform: 'uppercase', opacity: 0.6 }}>
          Loading Product Details...
        </p>
      </div>
    );
  }

  if (!productData || !productData.product) {
    return (
      <div className="product-page" style={{ textAlign: 'center', padding: '120px 20px' }}>
        <h2>Product Not Found</h2>
        <p style={{ marginTop: '12px', marginBottom: '24px', opacity: 0.6 }}>
          We couldn't find the product you're looking for.
        </p>
        <Link to="/browse" className="btn-add" style={{ display: 'inline-block', width: 'auto', padding: '12px 32px', textDecoration: 'none' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const { product, variants, reviews } = productData;
  const formattedPrice = `₹ ${Number(product.price).toLocaleString('en-IN')}`;
  const defaultImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
  const imageUrl = product.image_url || defaultImage;

  const toggleAcc = (section) => {
    setOpenAcc((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const availableSizes = variants && variants.length > 0 
    ? variants.map((v) => v.size_value)
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const currentVariant = variants?.find((v) => v.size_value === selectedSize);
  const currentStock = currentVariant ? currentVariant.stock : null;

  return (
    <div className="product-page">
      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to="/browse">Shop</Link>
        <span className="sep">/</span>
        <span className="current">{product.name}</span>
      </div>

      <section className="product-main">
        <div className="gallery">
          <div className="main-image">
            <div className="main-tag">New</div>
            <img
              src={imageUrl}
              alt={product.name}
              onError={(e) => {
                e.target.src = defaultImage;
              }}
            />
          </div>
        </div>

        <div className="product-info">
          <p className="info-eyebrow">{product.brand || 'Maison'} / {product.category || 'Editorial'}</p>
          <h1 className="info-title">
            {product.name}
          </h1>

          <div className="info-price">
            <span className="sale">{formattedPrice}</span>
            {product.rating && (
              <span style={{ fontSize: '13px', marginLeft: '16px', color: '#d4af37' }}>
                ★ {product.rating} ({product.rating_count || 0} reviews)
              </span>
            )}
          </div>

          <p className="info-desc">
            {product.description || 'Crafted with premium materials and designed for timeless elegance and everyday comfort.'}
          </p>

          <div className="option-block">
            <div className="option-label">
              <span>Size</span>
              <span className="value">Selected: {selectedSize}</span>
            </div>
            <div className="size-grid">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-box ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '12px' }}>
              <Link to="/browse" className="size-link">Find your size</Link>
            </div>
          </div>

          <div className="actions">
            <button className="btn-add" type="button">Add to bag</button>
            <button className="btn-save" type="button">♡</button>
          </div>

          {currentStock !== null && currentStock <= 5 ? (
            <div className="stock-note" style={{ color: '#c0392b', fontWeight: '600' }}>
              🔥 Low Stock — Only {currentStock} left in size {selectedSize}!
            </div>
          ) : (
            <div className="stock-note">
              ✓ In stock ({currentStock !== null ? `${currentStock} available` : 'Ready to ship'})
            </div>
          )}

          <div className="accordion">
            <div className="acc-item">
              <div
                className="acc-head"
                onClick={() => toggleAcc('desc')}
                style={{ cursor: 'pointer' }}
              >
                <span className="label">Description & Fit</span>
                <span className="icon">{openAcc.desc ? '−' : '+'}</span>
              </div>
              {openAcc.desc && (
                <div className="acc-body">
                  <div className="acc-body-inner">
                    {product.description || 'Classic silhouette tailored with precision. Machine wash cold or dry clean recommended.'}
                  </div>
                </div>
              )}
            </div>

            <div className="acc-item">
              <div
                className="acc-head"
                onClick={() => toggleAcc('reviews')}
                style={{ cursor: 'pointer' }}
              >
                <span className="label">Customer Reviews ({reviews ? reviews.length : 0})</span>
                <span className="icon">{openAcc.reviews ? '−' : '+'}</span>
              </div>
              {openAcc.reviews && (
                <div className="acc-body">
                  <div className="acc-body-inner">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev.id} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '12px' }}>{rev.reviewer_name}</strong>
                            <span style={{ color: '#d4af37', fontSize: '12px' }}>{'★'.repeat(rev.rating)}</span>
                          </div>
                          <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '12px', opacity: 0.6 }}>No customer reviews yet. Be the first to review this product!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="delivery-strip">
            <div className="delivery-row">
              <span className="mark">✓</span>
              <span>Free express delivery on orders above ₹ 10,000.</span>
            </div>
            <div className="delivery-row">
              <span className="mark">✓</span>
              <span>Easy 30-day return policy for online purchases.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="section-header">
          <h2 className="section-title">
            You may also <em>like</em>
          </h2>
          <Link to="/browse" className="section-link">View All</Link>
        </div>
      </section>
    </div>
  );
};

export default Product;
