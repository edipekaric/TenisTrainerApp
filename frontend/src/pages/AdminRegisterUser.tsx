import React, { useState } from 'react';
import AdminHeaderBar from '../components/AdminHeaderBar';
import { adminRegisterUser } from '../api/userApi';
import Footer from '../components/Footer';

const AdminRegisterUser: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'USER',
    balance: '0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.first_name.trim()) {
      newErrors.push('First name is required');
    }

    if (!formData.last_name.trim()) {
      newErrors.push('Last name is required');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    if (formData.balance && isNaN(Number(formData.balance))) {
      newErrors.push('Balance must be a valid number');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      await adminRegisterUser({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        role: formData.role as 'USER' | 'ADMIN',
        balance: Number(formData.balance) || 0
      });

      setSuccess(true);
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'USER',
        balance: '0'
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        setErrors([error.response.data]);
      } else {
        setErrors(['Registration failed. Please try again.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'USER',
      balance: '0'
    });
    setErrors([]);
    setSuccess(false);
  };

  return (
    <>
      <AdminHeaderBar />
      <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Register New User</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Create a new user account in the system</p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#155724'
          }}>
            <strong>✅ Success!</strong> User has been registered successfully.
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div style={{
            padding: '15px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#721c24'
          }}>
            <strong>❌ Please fix the following errors:</strong>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Registration Form */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            
            {/* Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  placeholder="Enter first name"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  placeholder="Enter last name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #bdc3c7',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
                placeholder="Enter email address"
                disabled={isSubmitting}
              />
            </div>

            {/* Phone Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                Phone Number (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #bdc3c7',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
                placeholder="Enter phone number"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  placeholder="Enter password"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  placeholder="Confirm password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Role and Balance Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  disabled={isSubmitting}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Initial Balance
                </label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#95a5a6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#7f8c8d';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#95a5a6';
                  }
                }}
              >
                🔄 Reset Form
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isSubmitting ? '#bdc3c7' : '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#229954';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#27ae60';
                  }
                }}
              >
                {isSubmitting ? '⏳ Registering...' : '✅ Register User'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <strong>💡 Tips:</strong>
          <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
            <li>Required fields are marked with an asterisk (*)</li>
            <li>Passwords must be at least 6 characters long</li>
            <li>Email addresses must be unique in the system</li>
            <li>Phone numbers are optional but recommended</li>
            <li>Initial balance can be set to any amount (default: $0.00)</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminRegisterUser;