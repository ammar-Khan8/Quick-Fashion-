import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Browse.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 40;

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortValue, setSortValue] = useState('featured');

  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const page = Math.max(1, parseInt(searchParams.get('page')) || 1);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('page', page);
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

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const goToPage = (newPage) => {
    const next = { page: newPage };
    if (search) next.search = search;
    if (category) next.category = category;
    setSearchParams(next);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const next = { page: 1 };
    if (category) next.category = category;
    const trimmed = searchInput.trim();
    if (trimmed) next.search = trimmed;
    setSearchParams(next);
  };

  const clearTag = (tagType) => {
    const next = { page: 1 };
    if (tagType === 'search') {
      if (category) next.category = category;
    } else if (tagType === 'category') {
      if (search) next.search = search;
    }
    setSearchParams(next);
  };

  const pageLabel = search
    ? `Search results for “${search}”`
    : category
    ? category.toUpperCase()
    : 'New Arrivals';

  return (
    <div className="browse-page">
      <header className="browse-hero">
        <p className="browse-eyebrow">Maison / Editorial</p>
        <form className="browse-search-form" onSubmit={handleSearchSubmit}>
          <input
            className="browse-search-input"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search the collection"
          />
          <button className="browse-search-submit" type="submit">Search</button>
        </form>
        <div className="browse-meta">
          <span>{total} items</span>
          <em>{pageLabel}</em>
        </div>
      </header>

      <div className="browse-layout">
        <aside className="browse-filters">
          <div className="filter-title">Filters</div>

          <div className="filter-group">
            <div className="filter-heading">Category</div>
            <div className="filter-body">
              <div className="filter-options">
                <div className="filter-option checked"><span className="box" />Women</div>
                <div className="filter-option"><span className="box" />Men</div>
                <div className="filter-option"><span className="box" />Kids</div>
                <div className="filter-option"><span className="box" />Home</div>
              </div>
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-heading">Color</div>
            <div className="filter-body">
              <div className="swatches">
                <span className="swatch active" style={{ background: '#0a0a0a' }} />
                <span className="swatch" style={{ background: '#b8956a' }} />
                <span className="swatch" style={{ background: '#c8b89a' }} />
                <span className="swatch" style={{ background: '#ede9e1' }} />
              </div>
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-heading">Price</div>
            <div className="filter-body">
              <div className="price-range">
                <span>₹ 2k</span>
                <input type="range" min="0" max="100" defaultValue="70" />
                <span>₹ 20k</span>
              </div>
            </div>
          </div>

          <button className="clear-filters" type="button">Clear Filters</button>
        </aside>

        <main className="browse-results">
          <div className="browse-toolbar">
            <div>
              <h1 className="results-title">{pageLabel}</h1>
              <p className="results-count">{total} items available</p>
            </div>

            <label className="sort-control" htmlFor="sort">
              Sort
              <select id="sort" value={sortValue} onChange={(event) => setSortValue(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>

          {(search || category) && (
            <div className="active-tags">
              {search && (
                <button className="active-tag" type="button" onClick={() => clearTag('search')}>
                  {search} <span className="x">×</span>
                </button>
              )}
              {category && (
                <button className="active-tag" type="button" onClick={() => clearTag('category')}>
                  {category} <span className="x">×</span>
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="browse-loading">Loading...</div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product, index) => (
                  <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                    <div className="product-media">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1550614000-4b95d4eb952c?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      {index === 0 && <div className="product-tag">New</div>}
                      {index === 2 && <div className="product-tag sale-tag-badge">Sale</div>}
                      <div className="product-quick">Quick Add</div>
                      <div className="product-save">♡</div>
                    </div>
                    <div className="product-name">{product.name}</div>
                    <div className="product-detail">Available in store</div>
                    <div className="product-price">{product.price}</div>
                  </Link>
                ))}
              </div>

              <div className="help-strip">
                <p className="help-text">
                  <strong>Need help?</strong> Our stylists can curate a look based on your search or favorite silhouettes.
                </p>
                <Link to="/" className="btn-ghost-dark">Back to home</Link>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
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

                  <button className="page-btn" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}