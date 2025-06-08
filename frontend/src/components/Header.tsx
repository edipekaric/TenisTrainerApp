import React, { useState } from 'react';
import './Header.css';
import '../styles/nicepage.css';
import logo from '../assets/logo.png';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className="u-clearfix u-header u-header"
      id="sec-6c67"
      style={{
        position: 'relative',
        padding: '0 40px',
        height: '100px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="u-clearfix u-sheet u-sheet-1"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Left: Logo */}
        <a
          href="/"
          className="u-image u-logo u-image-1"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            marginTop: '-8px', // move logo up a bit
          }}
          onClick={closeMenu}
        >
          <img
            src={logo}
            className="u-logo-image u-logo-image-1"
            alt="Logo"
            style={{
              maxHeight: '60px',
              width: 'auto',
            }}
          />
        </a>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-button"
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Right: Menu */}
        <nav className="u-menu u-menu-dropdown u-offcanvas u-menu-1 desktop-menu">
          <div className="u-custom-menu u-nav-container">
            <ul
              className="u-nav u-unstyled u-nav-1"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                paddingTop: '80px',
              }}
            >
              <li className="u-nav-item">
                <a className="u-button-style u-nav-link" href="/" onClick={closeMenu}>Home</a>
              </li>
              <li className="u-nav-item">
                <a className="u-button-style u-nav-link" href="/about" onClick={closeMenu}>About</a>
              </li>
              <li className="u-nav-item">
                <a className="u-button-style u-nav-link" href="/contact" onClick={closeMenu}>Contact</a>
              </li>
              <li className="u-nav-item">
                <a className="u-button-style u-nav-link" href="/login" onClick={closeMenu}>Log In</a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Center: Title */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '48%',
            transform: 'translate(-50%, -50%)',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          Tenis Coach Tarik
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            <li>
              <a href="/" onClick={closeMenu}>Home</a>
            </li>
            <li>
              <a href="/about" onClick={closeMenu}>About</a>
            </li>
            <li>
              <a href="/contact" onClick={closeMenu}>Contact</a>
            </li>
            <li>
              <a href="/login" onClick={closeMenu}>Log In</a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
