import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, ShoppingBag, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  return (
    <>
      <header className="zara-header">
        <div className="header-left">
          <button className="icon-btn" onClick={toggleDrawer}>
            <Menu strokeWidth={1} size={28} />
          </button>
          <Link to="/" className="logo-text">QUICK FASHION</Link>
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
          <Link to="/profile/user" className="icon-link"><User strokeWidth={1} size={24} /></Link>
          <Link to="/cart" className="icon-link"><ShoppingBag strokeWidth={1} size={24} /></Link>
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
          <Link to="/profile/user" onClick={toggleDrawer}>MY ACCOUNT</Link>
          <Link to="#" onClick={toggleDrawer}>HELP</Link>
        </div>
      </div>
    </>
  );
}