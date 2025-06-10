// src/components/AdminHeaderBar.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/authApi';
import logo from '../assets/logo.png';

const AdminHeaderBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/admin-dash');
  };

  const handleAllUsersClick = () => {
    navigate('/admin/users');
  };

  const handleRegisterUserClick = () => {
    navigate('/admin/register-user');
  };

  const handleTransactionClick = () => {
    navigate('/admin/transaction');
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
        <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '15px' }} />
        <h2>Booking App - Admin</h2>
      </div>
      <div>
        {/* Home Button */}
        <button onClick={handleHomeClick} style={buttonStyle}>
          🏠 Admin Dashboard
        </button>
        
        {/* Register User Button */}
        <button onClick={handleRegisterUserClick} style={{...buttonStyle, backgroundColor: '#f39c12'}}>
          ➕ Register User
        </button>
        
        {/* Transaction Button */}
        <button onClick={handleTransactionClick} style={{...buttonStyle, backgroundColor: '#9b59b6'}}>
          💰 Transaction
        </button>
        
        {/* All Users Button */}
        <button onClick={handleAllUsersClick} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>
          👥 All Users
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

export default AdminHeaderBar;