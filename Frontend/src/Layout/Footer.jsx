import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="zara-footer">
      <div className="footer-newsletter">
        <h3 className="newsletter-title">JOIN OUR NEWSLETTER</h3>
        <div className="newsletter-input-group">
          <input type="email" placeholder="ENTER YOUR EMAIL FOR NEWS" className="newsletter-input" />
        </div>
      </div>

      <div className="footer-links-grid">
        <div className="footer-col">
          <h4>HELP</h4>
          <ul>
            <li><a href="#">SHOP AT QUICK FASHION</a></li>
            <li><a href="#">PRODUCT</a></li>
            <li><a href="#">PAYMENT</a></li>
            <li><a href="#">SHIPPING</a></li>
            <li><a href="#">EXCHANGES AND RETURNS</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>FOLLOW US</h4>
          <ul>
            <li><a href="#">NEWSLETTER</a></li>
            <li><a href="#">INSTAGRAM</a></li>
            <li><a href="#">FACEBOOK</a></li>
            <li><a href="#">TWITTER</a></li>
            <li><a href="#">PINTEREST</a></li>
            <li><a href="#">YOUTUBE</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>COMPANY</h4>
          <ul>
            <li><a href="#">ABOUT US</a></li>
            <li><a href="#">JOIN LIFE</a></li>
            <li><a href="#">OFFICES</a></li>
            <li><a href="#">STORES</a></li>
            <li><a href="#">WORK WITH US</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>POLICIES</h4>
          <ul>
            <li><a href="#">PRIVACY POLICY</a></li>
            <li><a href="#">PURCHASE CONDITIONS</a></li>
            <li><a href="#">COOKIES SETTINGS</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-locale">
          <span>INDIA</span>
        </div>
        <div className="footer-copyright">
          <span>© ALL RIGHTS RESERVED - QUICK FASHION {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}