// src/components/UserHeaderBar.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/authApi';

const UserHeaderBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/user-dash');
  };

  const handleUserProfileClick = () => {
    navigate('/user-profile');
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
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={handleHomeClick}
      >
        <img src="/logo.jpg" alt="Logo" style={{ height: '40px', marginRight: '15px' }} />
        <h2>Booking App</h2>
      </div>
      <div>
        {/* Home Button */}
        <button onClick={handleHomeClick} style={buttonStyle}>
          🏠 Dashboard
        </button>
        
        {/* User Profile Button */}
        <button onClick={handleUserProfileClick} style={buttonStyle}>
          👤 User Profile
        </button>
        
        <button onClick={handleLogout} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>
          🚪 Log Off
        </button>
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
  fontSize: '14px',
  fontWeight: 'bold' as const,
  transition: 'background-color 0.2s ease',
};

export default UserHeaderBar;