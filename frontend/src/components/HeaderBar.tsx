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

  const handleHomeClick = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleManageUsersClick = () => {
    navigate('/admin/users');
  };

  // Get user role to determine what to show
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';

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
          🏠 Home
        </button>
        
        {/* Conditional Profile/All Users Button */}
        {isAdmin ? (
          <button onClick={handleManageUsersClick} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>
            👥 All Users
          </button>
        ) : (
          <button onClick={() => navigate('/user-profile')} style={buttonStyle}>
            👤 User Profile
          </button>
        )}
        
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

export default HeaderBar;