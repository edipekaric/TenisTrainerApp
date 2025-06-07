import React from 'react';
import '../styles/nicepage.css';
import logo from '../assets/logo.png';

const Header: React.FC = () => {
  return (
    <header className="u-clearfix u-header u-header" id="sec-6c67">
      <div className="u-clearfix u-sheet u-sheet-1">
        <a href="/" className="u-image u-logo u-image-1">
          <img src={logo} className="u-logo-image u-logo-image-1" alt="Logo" />
        </a>
        <nav className="u-menu u-menu-dropdown u-offcanvas u-menu-1">
          <div className="menu-collapse">
            <a className="u-button-style u-nav-link" href="#">
              <svg viewBox="0 0 24 24">
                <use xlinkHref="#menu-hamburger" />
              </svg>
            </a>
          </div>
          <div className="u-custom-menu u-nav-container">
            <ul className="u-nav u-unstyled u-nav-1">
              <li className="u-nav-item"><a className="u-button-style u-nav-link" href="/">Home</a></li>
              <li className="u-nav-item"><a className="u-button-style u-nav-link" href="/AboutPage">About</a></li>
              <li className="u-nav-item"><a className="u-button-style u-nav-link" href="/ContactPage">Contact</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
