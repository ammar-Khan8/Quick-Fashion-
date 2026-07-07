import React from 'react';
import { Link } from 'react-router-dom';
import './Product.css';

const Product = () => {
  return (
    <div className="product-page">
      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to="/browse">Shop</Link>
        <span className="sep">/</span>
        <span className="current">Structured Wool Coat</span>
      </div>

      <section className="product-main">
        <div className="gallery">
          <div className="main-image">
            <div className="main-tag">New</div>
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop"
              alt="Structured Wool Coat"
            />
          </div>
        </div>

        <div className="product-info">
          <p className="info-eyebrow">Maison / Winter Edit</p>
          <h1 className="info-title">
            Structured <em>Wool Coat</em>
          </h1>
          <div className="info-price">
            <span className="old">₹ 18,000</span>
            <span className="sale">₹ 14,500</span>
          </div>

          <p className="info-desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <div className="option-block">
            <div className="option-label">
              <span>Colour</span>
              <span className="value">Espresso</span>
            </div>
            <div className="swatches">
              <span className="swatch sw-1 active" />
              <span className="swatch sw-2" />
              <span className="swatch sw-3" />
            </div>
          </div>

          <div className="option-block">
            <div className="option-label">
              <span>Size</span>
              <span className="value">Select your fit</span>
            </div>
            <div className="size-grid">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button key={size} className={`size-box ${size === 'M' ? 'active' : ''}`}>
                  {size}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '12px' }}>
              <Link to="/browse" className="size-link">Find your size</Link>
            </div>
          </div>

          <div className="actions">
            <button className="btn-add">Add to bag</button>
            <button className="btn-save">♡</button>
          </div>

          <div className="stock-note">In stock and ready to ship</div>

          <div className="accordion">
            <div className="acc-item">
              <div className="acc-head">
                <span className="label">Description</span>
                <span className="icon">+</span>
              </div>
              <div className="acc-body">
                <div className="acc-body-inner">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae sapien euismod, fermentum urna non, bibendum metus.
                </div>
              </div>
            </div>

            <div className="acc-item">
              <div className="acc-head">
                <span className="label">Reviews</span>
                <span className="icon">+</span>
              </div>
              <div className="acc-body">
                <div className="acc-body-inner">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
                </div>
              </div>
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
