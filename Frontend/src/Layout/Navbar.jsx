import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, ShoppingBag, X, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSearchKeys = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsDrawerOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      // credentials: 'include' ensures the browser sends the httpOnly refresh-token
      // cookie so the backend can revoke it and clear the cookie server-side.
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear frontend state regardless of backend result to avoid stale UI.
    // Note: refreshToken is NOT in localStorage — it's an httpOnly cookie
    // cleared by the backend above, so JS never needs to remove it.
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('authChange'));
    setIsDrawerOpen(false);
    setIsAuthenticated(false);
    navigate('/login');
  };

  useEffect(() => {
    const handler = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('authChange', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('authChange', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return (
    <>
      <header className="zara-header">
        <div className="header-left">
          <button className="icon-btn" onClick={toggleDrawer}>
            <Menu strokeWidth={1} size={28} />
          </button>
          <Link to="/" className="logo-text">FITZYYY</Link>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="SEARCH" 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeys}
            />
          </div>
          <Link to="#" className="icon-link"><Search strokeWidth={1} size={24} className="mobile-search-icon" /></Link>
          <Link to="/profile" className="icon-link"><User strokeWidth={1} size={24} /></Link>
          <Link to="/cart" className="icon-link"><ShoppingBag strokeWidth={1} size={24} /></Link>
          {/* //search,user,shopping etc are from lucide */}
        </div>
      </header>

      {/* Side Drawer Overlay */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={toggleDrawer}></div>

      {/* Side Drawer */}
      <div className={`side-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <button className="icon-btn" onClick={toggleDrawer}>
            <X strokeWidth={1} size={28} />
          </button>
        </div>
        <div className="drawer-content">
          <ul className="drawer-links">
            <li><Link to="/" onClick={toggleDrawer}>HOME</Link></li>
            <li><Link to="/browse" onClick={toggleDrawer}>NEW IN</Link></li>
            <li><Link to="/browse" onClick={toggleDrawer}>WOMAN</Link></li>
            <li><Link to="/browse" onClick={toggleDrawer}>MAN</Link></li>
            <li><Link to="/browse" onClick={toggleDrawer}>KIDS</Link></li>
            <li><Link to="/browse" onClick={toggleDrawer}>BEAUTY</Link></li>
          </ul>
        </div>
        <div className="drawer-footer">
          <Link to="/profile" onClick={toggleDrawer}>MY ACCOUNT</Link>
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                fontSize: 'inherit',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={18} /> LOGOUT
            </button>
          ) : (
            <Link to="/login" onClick={toggleDrawer}>LOGIN</Link>
          )}
          <Link to="#" onClick={toggleDrawer}>HELP</Link>
        </div>
      </div>
    </>
  );
}