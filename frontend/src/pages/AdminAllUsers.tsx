import React, { useEffect, useState } from 'react';
import AdminHeaderBar from '../components/AdminHeaderBar';
import { getAllUsers, resetUserPassword } from '../api/userApi';
import Footer from '../components/Footer';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  balance?: number;
  role: string;
  created_at?: string;
}

const AdminAllUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    show: boolean;
    user: User | null;
  }>({ show: false, user: null });
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordModal({ show: true, user });
    setNewPassword('');
  };

  const handlePasswordSubmit = async () => {
    if (!resetPasswordModal.user || !newPassword.trim()) {
      alert('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);
    try {
      await resetUserPassword(resetPasswordModal.user.id, newPassword);
      alert(`Password for ${resetPasswordModal.user.first_name} ${resetPasswordModal.user.last_name} has been reset successfully!`);
      setResetPasswordModal({ show: false, user: null });
      setNewPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error.response?.data) {
        alert(`Failed to reset password: ${error.response.data}`);
      } else {
        alert('Failed to reset password. Please try again.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleModalClose = () => {
    setResetPasswordModal({ show: false, user: null });
    setNewPassword('');
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getUserStats = () => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const userCount = users.filter(u => u.role === 'USER').length;
    
    return { totalUsers, adminCount, userCount };
  };

  const stats = getUserStats();

  return (
    <>
      <AdminHeaderBar />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>All Users</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Manage and view all users in the system</p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#3498db',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Users</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.adminCount}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Administrators</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#27ae60',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(39, 174, 96, 0.3)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.userCount}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Regular Users</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '12px',
              border: '1px solid #bdc3c7',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #bdc3c7',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="USER">Users</option>
          </select>
          
          <button
            onClick={loadUsers}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#bdc3c7' : '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Users Table */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
              {searchTerm || roleFilter !== 'ALL' ? 'No users match your search criteria.' : 'No users found.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      ID
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Name
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Email
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Phone
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Balance
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Role
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Reset Password
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa'}
                    >
                      <td style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #dee2e6',
                        color: '#7f8c8d',
                        fontWeight: 'bold'
                      }}>
                        #{user.id}
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #dee2e6',
                        color: '#2c3e50',
                        fontWeight: 'bold'
                      }}>
                        {user.first_name} {user.last_name}
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #dee2e6',
                        color: '#34495e'
                      }}>
                        {user.email}
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #dee2e6',
                        color: '#34495e'
                      }}>
                        {user.phone || 'N/A'}
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #dee2e6',
                        color: '#27ae60',
                        fontWeight: 'bold'
                      }}>
                        ${user.balance?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: user.role === 'ADMIN' ? '#e74c3c' : '#27ae60',
                          color: '#fff'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        <button
                          onClick={() => handleResetPassword(user)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f39c12',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e67e22';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f39c12';
                          }}
                        >
                          🔑 Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Reset Password Modal */}
        {resetPasswordModal.show && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              minWidth: '400px',
              maxWidth: '500px'
            }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>
                🔑 Reset Password
              </h3>
              
              {resetPasswordModal.user && (
                <div style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                    Resetting password for:
                  </div>
                  <div style={{ color: '#34495e' }}>
                    {resetPasswordModal.user.first_name} {resetPasswordModal.user.last_name}
                  </div>
                  <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
                    {resetPasswordModal.user.email}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  New Password:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  placeholder="Enter new password (minimum 6 characters)"
                  disabled={isResetting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                />
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  Password must be at least 6 characters long
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleModalClose}
                  disabled={isResetting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#95a5a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isResetting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={isResetting || !newPassword.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isResetting || !newPassword.trim() ? '#bdc3c7' : '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isResetting || !newPassword.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {isResetting ? '⏳ Resetting...' : '🔑 Reset Password'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Results Summary */}
        {!loading && (
          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            color: '#7f8c8d',
            fontSize: '14px'
          }}>
            Showing {filteredUsers.length} of {users.length} users
            {(searchTerm || roleFilter !== 'ALL') && (
              <span> (filtered)</span>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AdminAllUsers;