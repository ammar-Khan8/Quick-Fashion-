import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Browse.css';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 40;

export default function Browse() {
  const [columns, setColumns] = useState(4);
  const [searchParams, setSearchParams] = useSearchParams();

  const search   = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const page     = Math.max(1, parseInt(searchParams.get('page')) || 1);

  const [products,   setProducts]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)   params.set('search',   search);
      if (category) params.set('category', category);
      params.set('page',  page);
      params.set('limit', PAGE_SIZE);

      const response = await fetch(`http://localhost:3000/api/products?${params}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const formatted = data.products.map((p, i) => ({
        ...p,
        image: p.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop&random=${p.id || i}`,
        price: `₹ ${Number(p.price).toLocaleString('en-IN')}`,
      }));

      setProducts(formatted);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts();
  }, [fetchProducts]);

  const goToPage = (newPage) => {
    const next = { page: newPage };
    if (search)   next.search   = search;
    if (category) next.category = category;
    setSearchParams(next);
  };

  const pageLabel = search
    ? `SEARCH: ${search.toUpperCase()}`
    : category
    ? category.toUpperCase()
    : 'NEW ARRIVALS';

  return (
    <div className="browse-container">
      <div className="browse-header">
        <div className="browse-title-area">
          <h1 className="browse-title">{pageLabel}</h1>
          <span className="product-count">{total} ITEMS</span>
        </div>

        <div className="browse-controls">
          <button className="control-btn"><Filter size={16} strokeWidth={1} /><span>FILTER</span></button>
          <div className="view-toggles">
            <button className={`toggle-btn ${columns === 2 ? 'active' : ''}`} onClick={() => setColumns(2)}>2</button>
            <button className={`toggle-btn ${columns === 4 ? 'active' : ''}`} onClick={() => setColumns(4)}>4</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="browse-loading">Loading...</div>
      ) : (
        <>
          <div className={`product-grid columns-${columns}`}>
            {products.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-item">
                <div className="product-media">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1550614000-4b95d4eb952c?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  <div className="add-to-bag-overlay">
                    <button className="add-btn">+</button>
                  </div>
                </div>
                <div className="product-details">
                  <span className="product-title">{product.name}</span>
                  <span className="product-price">{product.price}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} />
                PREV
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                    ) : (
                      <button
                        key={item}
                        className={`page-num ${item === page ? 'active' : ''}`}
                        onClick={() => goToPage(item)}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <button
                className="page-btn"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                NEXT
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}