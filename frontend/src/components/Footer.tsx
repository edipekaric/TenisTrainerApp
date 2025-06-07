import React from 'react';
import '../styles/nicepage.css';

const Footer: React.FC = () => {
  return (
    <footer className="u-clearfix u-footer u-grey-80 u-footer" id="sec-bdf5">
      <div className="u-clearfix u-sheet u-sheet-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
        <p className="u-small-text u-text u-text-variant u-text-1" style={{ textAlign: 'center', margin: 0 }}>
          Powered by @pekaricc
        </p>
      </div>
    </footer>
  );
};

export default Footer;
