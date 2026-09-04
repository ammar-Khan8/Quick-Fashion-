import React, { useState, useEffect, useMemo } from 'react';

const GENDER_COLORS = {
  women:  { bg: '#fff0f5', text: '#c2185b', border: '#f48fb1' },
  men:    { bg: '#e8f4fd', text: '#1565c0', border: '#90caf9' },
  kids:   { bg: '#f3ffe8', text: '#2e7d32', border: '#a5d6a7' },
  unisex: { bg: '#f5f5f5', text: '#555',    border: '#ccc'    },
};

const GENDERS = ['all', 'women', 'men', 'kids'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortCol, setSortCol]   = useState('category');
  const [sortDir, setSortDir]   = useState('asc');

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/products')
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => setProducts(d.products || []))
      .catch(() => setError('Could not load products. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (genderFilter !== 'all') list = list.filter(p => p.gender === genderFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const av = (a[sortCol] || '').toLowerCase();
      const bv = (b[sortCol] || '').toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [products, genderFilter, search, sortCol, sortDir]);

  // Count per gender
  const counts = useMemo(() => {
    const c = { all: products.length, women: 0, men: 0, kids: 0, unisex: 0 };
    products.forEach(p => { if (c[p.gender] !== undefined) c[p.gender]++; });
    return c;
  }, [products]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortArrow = ({ col }) =>
    sortCol === col ? <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span> : null;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🗂️ Product Gender Review</h1>
          <p style={styles.subtitle}>Temporary admin view — {products.length} products total</p>
        </div>
        <a href="/" style={styles.backBtn}>← Back to site</a>
      </div>

      {/* Stat pills */}
      <div style={styles.statRow}>
        {GENDERS.map(g => (
          <button
            key={g}
            onClick={() => setGenderFilter(g)}
            style={{
              ...styles.statPill,
              ...(genderFilter === g ? styles.statPillActive : {}),
              ...(g !== 'all' ? {
                background: genderFilter === g ? GENDER_COLORS[g].bg : '#fff',
                color: genderFilter === g ? GENDER_COLORS[g].text : '#555',
                borderColor: genderFilter === g ? GENDER_COLORS[g].border : '#ddd',
              } : {})
            }}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
            <span style={styles.pillCount}>{counts[g] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button style={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Table */}
      {loading && <div style={styles.status}>Loading products...</div>}
      {error   && <div style={{ ...styles.status, color: '#c0392b' }}>{error}</div>}

      {!loading && !error && (
        <>
          <p style={styles.resultCount}>
            Showing <strong>{filtered.length}</strong> of {products.length} products
          </p>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Image</th>
                  <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort('id')}>
                    ID <SortArrow col="id" />
                  </th>
                  <th style={{ ...styles.th, cursor: 'pointer', minWidth: 320 }} onClick={() => handleSort('name')}>
                    Name <SortArrow col="name" />
                  </th>
                  <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    Category <SortArrow col="category" />
                  </th>
                  <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort('gender')}>
                    Gender <SortArrow col="gender" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const gc = GENDER_COLORS[p.gender] || GENDER_COLORS.unisex;
                  return (
                    <tr key={p.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, padding: '6px 12px' }}>
                        <img
                          src={p.image_url || ''}
                          alt={p.name}
                          style={p.gender === 'unisex'
                            ? { ...styles.thumb, width: 120, height: 120 }
                            : styles.thumb}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <div style={{ ...styles.thumbFallback, display: 'none',
                          ...(p.gender === 'unisex' ? { width: 120, height: 120 } : {}) }}>?</div>
                      </td>
                      <td style={{ ...styles.td, color: '#999', fontSize: 12 }}>{p.id}</td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{p.name}</td>
                      <td style={styles.td}>
                        <span style={styles.catBadge}>{p.category || '—'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.genderBadge,
                          background: gc.bg,
                          color: gc.text,
                          border: `1px solid ${gc.border}`,
                        }}>
                          {p.gender || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px 80px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: '#111' },
  subtitle: { margin: '4px 0 0', color: '#888', fontSize: 14 },
  backBtn: {
    padding: '8px 18px',
    borderRadius: 8,
    border: '1px solid #ddd',
    background: '#fff',
    color: '#333',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  statRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
  statPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 16px',
    borderRadius: 999,
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#555',
    transition: 'all 0.15s',
  },
  statPillActive: {
    background: '#111',
    color: '#fff',
    borderColor: '#111',
  },
  pillCount: {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: 999,
    padding: '1px 8px',
    fontSize: 12,
    fontWeight: 700,
  },
  searchWrap: { position: 'relative', marginBottom: 16 },
  searchInput: {
    width: '100%',
    padding: '10px 40px 10px 14px',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#111',
  },
  clearSearch: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: 16,
  },
  status: { textAlign: 'center', padding: 40, color: '#888', fontSize: 15 },
  resultCount: { margin: '0 0 12px', fontSize: 13, color: '#888' },
  tableWrap: { overflowX: 'auto', borderRadius: 10, border: '1px solid #e5e5e5' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    background: '#f8f8f8',
    borderBottom: '1px solid #e5e5e5',
    fontWeight: 600,
    color: '#444',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  td: { padding: '10px 16px', color: '#222', verticalAlign: 'middle' },
  rowEven: { background: '#fff' },
  rowOdd:  { background: '#fafafa' },
  catBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 6,
    background: '#f0f0f0',
    color: '#555',
    fontSize: 12,
    fontWeight: 500,
  },
  genderBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  thumb: {
    width: 56,
    height: 56,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    display: 'block',
  },
  thumbFallback: {
    width: 56,
    height: 56,
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    background: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bbb',
    fontSize: 18,
  },
};
