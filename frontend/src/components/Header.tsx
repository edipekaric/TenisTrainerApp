import React from 'react';
import '../styles/nicepage.css';
import logo from '../assets/logo.png';

const Header: React.FC = () => {
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
          }}
        >
          <img
            src={logo}
            className="u-logo-image u-logo-image-1"
            alt="Logo"
            style={{
              maxHeight: '60px', // prevent it from going under header
              width: 'auto',
            }}
          />
        </a>

        {/* Right: Menu */}
        <nav
          className="u-menu u-menu-dropdown u-offcanvas u-menu-1"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
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
                <a className="u-button-style u-nav-link" href="/">Home</a>
              </li>
              <li className="u-nav-item">
                <a className="u-button-style u-nav-link" href="/about">About</a>
              </li>
              <li className="u-nav-item">
                <a className="u-button-style u-nav-link" href="/contact">Contact</a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Center: Title */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '48%', // slight move up!
            transform: 'translate(-50%, -50%)',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000',
            whiteSpace: 'nowrap',
            pointerEvents: 'none', // so it's not clickable
          }}
        >
          Tenis Coach Tarik
        </div>
      </div>
    </header>
  );
};

export default Header;
