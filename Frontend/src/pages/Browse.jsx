import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Browse.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 40;

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortValue, setSortValue] = useState('featured');

  const search    = searchParams.get('search')?.toLowerCase() || '';
  const category  = searchParams.get('category') || '';
  const gender    = searchParams.get('gender') || '';
  const size      = searchParams.get('size') || '';
  const minRating = parseFloat(searchParams.get('minRating')) || 0;
  const page      = Math.max(1, parseInt(searchParams.get('page')) || 1);
  const priceMin  = parseInt(searchParams.get('priceMin')) || 0;
  const priceMax  = parseInt(searchParams.get('priceMax')) || 20000;

  // Local slider state — only committed to URL on mouse-up
  const [sliderMin, setSliderMin] = useState(priceMin);
  const [sliderMax, setSliderMax] = useState(priceMax);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [openFilters, setOpenFilters] = useState({
    category: true,
    gender: true,
    price: true,
    size: true,
    rating: true,
  });

  const toggleFilterGroup = (group) => {
    setOpenFilters((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)    params.set('search', search);
      if (category)  params.set('category', category);
      if (gender)    params.set('gender', gender);
      if (size)      params.set('size', size);
      if (minRating) params.set('minRating', minRating);
      if (priceMin > 0)     params.set('minPrice', priceMin);
      if (priceMax < 20000) params.set('maxPrice', priceMax);
      params.set('page', page);
      params.set('limit', PAGE_SIZE);

      const response = await fetch(`http://localhost:3000/api/products?${params}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const formatted = data.products.map((p, i) => ({
        ...p,
        image: p.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop&random=${p.id || i}`,
        price: `₹ ${Number(p.price).toLocaleString('en-IN')}`,
        rawPrice: Number(p.price),
      }));

      setProducts(formatted);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, gender, size, minRating, page, priceMin, priceMax]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Keep local sliders in sync when URL params change externally
  useEffect(() => { setSliderMin(priceMin); }, [priceMin]);
  useEffect(() => { setSliderMax(priceMax); }, [priceMax]);

  const commitPrice = () => {
    const next = { page: 1 };
    if (search)   next.search = search;
    if (category) next.category = category;
    if (gender)   next.gender = gender;
    if (size)     next.size = size;
    if (minRating) next.minRating = minRating;
    if (sliderMin > 0)     next.priceMin = sliderMin;
    if (sliderMax < 20000) next.priceMax = sliderMax;
    setSearchParams(next);
  };

  const goToPage = (newPage) => {
    const next = { page: newPage };
    if (search)   next.search = search;
    if (category) next.category = category;
    if (gender)   next.gender = gender;
    if (size)     next.size = size;
    if (minRating) next.minRating = minRating;
    if (priceMin > 0)     next.priceMin = priceMin;
    if (priceMax < 20000) next.priceMax = priceMax;
    setSearchParams(next);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const next = { page: 1 };
    if (category) next.category = category;
    if (gender)   next.gender = gender;
    if (size)     next.size = size;
    if (minRating) next.minRating = minRating;
    if (priceMin > 0)     next.priceMin = priceMin;
    if (priceMax < 20000) next.priceMax = priceMax;
    const trimmed = searchInput.trim();
    if (trimmed) next.search = trimmed;
    setSearchParams(next);
  };

  const toggleGender = (g) => {
    const next = { page: 1 };
    if (search)   next.search = search;
    if (category) next.category = category;
    if (size)     next.size = size;
    if (minRating) next.minRating = minRating;
    if (priceMin > 0)     next.priceMin = priceMin;
    if (priceMax < 20000) next.priceMax = priceMax;
    if (gender !== g) next.gender = g;
    setSearchParams(next);
  };

  const toggleSize = (sz) => {
    const next = { page: 1 };
    if (search)   next.search = search;
    if (category) next.category = category;
    if (gender)   next.gender = gender;
    if (minRating) next.minRating = minRating;
    if (priceMin > 0)     next.priceMin = priceMin;
    if (priceMax < 20000) next.priceMax = priceMax;
    if (size !== sz) next.size = sz;
    setSearchParams(next);
  };

  const toggleRating = (r) => {
    const next = { page: 1 };
    if (search)   next.search = search;
    if (category) next.category = category;
    if (gender)   next.gender = gender;
    if (size)     next.size = size;
    if (priceMin > 0)     next.priceMin = priceMin;
    if (priceMax < 20000) next.priceMax = priceMax;
    if (minRating !== r) next.minRating = r;
    setSearchParams(next);
  };

  const clearTag = (tagType) => {
    const next = { page: 1 };
    if (tagType !== 'search'    && search)    next.search = search;
    if (tagType !== 'category'  && category)  next.category = category;
    if (tagType !== 'gender'    && gender)    next.gender = gender;
    if (tagType !== 'size'      && size)      next.size = size;
    if (tagType !== 'rating'    && minRating) next.minRating = minRating;
    if (tagType !== 'price') {
      if (priceMin > 0)     next.priceMin = priceMin;
      if (priceMax < 20000) next.priceMax = priceMax;
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSliderMin(0);
    setSliderMax(20000);
    setSearchParams({ page: 1 });
  };

  const priceActive = priceMin > 0 || priceMax < 20000;

  const pageLabel = search
    ? `Search results for "${search}"`
    : category
    ? category.toUpperCase()
    : gender
    ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Collection`
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

          <div className={`filter-group ${openFilters.category ? 'open' : 'collapsed'}`}>
            <div
              className="filter-heading"
              onClick={() => toggleFilterGroup('category')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFilterGroup('category');
                }
              }}
            >
              Category
            </div>
            <div className="filter-body">
              <div className="filter-body-inner">
                <div className="filter-options">
                  {['Kurti', 'Dress', 'Shirt', 'T-Shirt', 'Jeans', 'Trousers', 'Jacket', 'Hoodie', 'Top', 'Saree'].map((cat) => (
                    <div
                      key={cat}
                      className={`filter-option${category.toLowerCase() === cat.toLowerCase() ? ' checked' : ''}`}
                      onClick={() => {
                        const next = { page: 1 };
                        if (search) next.search = search;
                        if (gender) next.gender = gender;
                        if (priceMin > 0) next.priceMin = priceMin;
                        if (priceMax < 20000) next.priceMax = priceMax;
                        if (category.toLowerCase() !== cat.toLowerCase()) next.category = cat;
                        setSearchParams(next);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="box" />
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`filter-group ${openFilters.gender ? 'open' : 'collapsed'}`}>
            <div
              className="filter-heading"
              onClick={() => toggleFilterGroup('gender')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFilterGroup('gender');
                }
              }}
            >
              Gender
            </div>
            <div className="filter-body">
              <div className="filter-body-inner">
                <div className="filter-options">
                  {['women', 'men', 'kids'].map((g) => (
                    <div
                      key={g}
                      className={`filter-option${gender === g ? ' checked' : ''}`}
                      onClick={() => toggleGender(g)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="box" />
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`filter-group ${openFilters.price ? 'open' : 'collapsed'}`}>
            <div
              className="filter-heading"
              onClick={() => toggleFilterGroup('price')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFilterGroup('price');
                }
              }}
            >
              Price
            </div>
            <div className="filter-body">
              <div className="filter-body-inner">
                <div className="price-labels">
                  <span>₹ {sliderMin.toLocaleString('en-IN')}</span>
                  <span>₹ {sliderMax.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-dual-range">
                  <input
                    className="price-slider price-slider--min"
                    type="range"
                    min="0"
                    max="20000"
                    step="500"
                    value={sliderMin}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value), sliderMax - 500);
                      setSliderMin(v);
                    }}
                    onMouseUp={commitPrice}
                    onTouchEnd={commitPrice}
                  />
                  <input
                    className="price-slider price-slider--max"
                    type="range"
                    min="0"
                    max="20000"
                    step="500"
                    value={sliderMax}
                    onChange={(e) => {
                      const v = Math.max(Number(e.target.value), sliderMin + 500);
                      setSliderMax(v);
                    }}
                    onMouseUp={commitPrice}
                    onTouchEnd={commitPrice}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`filter-group ${openFilters.size ? 'open' : 'collapsed'}`}>
            <div
              className="filter-heading"
              onClick={() => toggleFilterGroup('size')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFilterGroup('size');
                }
              }}
            >
              Size
            </div>
            <div className="filter-body">
              <div className="filter-body-inner">
                <div className="filter-options">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <div
                      key={sz}
                      className={`filter-option${size.toUpperCase() === sz ? ' checked' : ''}`}
                      onClick={() => toggleSize(sz)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="box" />
                      {sz}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`filter-group ${openFilters.rating ? 'open' : 'collapsed'}`}>
            <div
              className="filter-heading"
              onClick={() => toggleFilterGroup('rating')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFilterGroup('rating');
                }
              }}
            >
              Customer Rating
            </div>
            <div className="filter-body">
              <div className="filter-body-inner">
                <div className="filter-options">
                  {[4, 3, 2, 1].map((r) => (
                    <div
                      key={r}
                      className={`filter-option${minRating === r ? ' checked' : ''}`}
                      onClick={() => toggleRating(r)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="box" />
                      <span className="star-rating">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span> & Up
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button className="clear-filters" type="button" onClick={clearAllFilters}>Clear Filters</button>
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

          {(search || category || gender || size || minRating || priceActive) && (
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
              {gender && (
                <button className="active-tag" type="button" onClick={() => clearTag('gender')}>
                  {gender} <span className="x">×</span>
                </button>
              )}
              {size && (
                <button className="active-tag" type="button" onClick={() => clearTag('size')}>
                  Size: {size} <span className="x">×</span>
                </button>
              )}
              {minRating > 0 && (
                <button className="active-tag" type="button" onClick={() => clearTag('rating')}>
                  {minRating}★ & Up <span className="x">×</span>
                </button>
              )}
              {priceActive && (
                <button className="active-tag" type="button" onClick={() => clearTag('price')}>
                  ₹{priceMin.toLocaleString('en-IN')} – ₹{priceMax.toLocaleString('en-IN')} <span className="x">×</span>
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