// src/components/HeaderBar.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/authApi';

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#2c3e50',
      color: '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/logo.jpg" alt="Logo" style={{ height: '40px', marginRight: '15px' }} />
        <h2>Booking App</h2>
      </div>
      <div>
        <button onClick={() => navigate('/user-profile')} style={buttonStyle}>User Profile</button>
        <button onClick={handleLogout} style={buttonStyle}>Log Off</button>
      </div>
    </header>
  );
};

const buttonStyle = {
  marginLeft: '10px',
  padding: '8px 12px',
  backgroundColor: '#3498db',
  border: 'none',
  borderRadius: '4px',
  color: '#fff',
  cursor: 'pointer',
};

export default HeaderBar;
