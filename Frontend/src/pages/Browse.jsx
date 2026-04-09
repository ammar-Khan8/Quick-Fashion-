import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Browse.css';
import { Filter } from 'lucide-react';

export default function Browse() {
  const [columns, setColumns] = useState(4);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search')?.toLowerCase() || '';
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/products?search=${encodeURIComponent(search)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Map the database rows to the structure expected by the frontend
        const formattedData = data.map((p, i) => ({
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
  }, [search]);

  return (
    <div className="browse-container">
      <div className="browse-header">
        <div className="browse-title-area">
          <h1 className="browse-title">{search ? `SEARCH: ${search.toUpperCase()}` : 'NEW ARRIVALS'}</h1>
          <span className="product-count">{products.length} ITEMS</span>
        </div>
        
        <div className="browse-controls">
          <button className="control-btn"><Filter size={16} strokeWidth={1} /><span>FILTER</span></button>
          <div className="view-toggles">
            <button className={`toggle-btn ${columns === 2 ? 'active' : ''}`} onClick={() => setColumns(2)}>2</button>
            <button className={`toggle-btn ${columns === 4 ? 'active' : ''}`} onClick={() => setColumns(4)}>4</button>
          </div>
        </div>
      </div>

      <div className={`product-grid columns-${columns}`}>
        {products.map(product => (
          <div key={product.id} className="product-item">
            <div className="product-media">
              <img src={product.image} alt={product.name} />
              <div className="add-to-bag-overlay">
                <button className="add-btn">+</button>
              </div>
            </div>
            <div className="product-details">
              <span className="product-title">{product.name}</span>
              <span className="product-price">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}