import React, { useState, useEffect } from 'react';
import AdminHeaderBar from '../components/AdminHeaderBar';
import { getAllUsers } from '../api/userApi';
import { createTransaction, getUserTransactions } from '../api/transactionApi';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  balance?: number;
  role: string;
}

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: 'ADD' | 'SUBTRACT';
  description: string;
  created_at?: string;
  user_name?: string;
}

const AdminTransaction: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      // Filter out admins and sort by name
      const regularUsers = usersData
        .filter(user => user.role !== 'ADMIN')
        .sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
      setUsers(regularUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setErrors(['Failed to load users. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTransactions = async (userId: number) => {
    setLoadingTransactions(true);
    try {
      const transactions = await getUserTransactions(userId);
      setUserTransactions(transactions);
    } catch (error) {
      console.error('Error loading user transactions:', error);
      setUserTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'selectedUserId') {
      setSelectedUserId(value);
      // Load transactions when user is selected
      if (value) {
        loadUserTransactions(parseInt(value));
      } else {
        setUserTransactions([]);
      }
    } else if (name === 'transactionType') {
      setTransactionType(value as 'ADD' | 'SUBTRACT');
    } else if (name === 'amount') {
      setAmount(value);
    } else if (name === 'description') {
      setDescription(value);
    }

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!selectedUserId) {
      newErrors.push('Please select a user');
    }

    if (!amount) {
      newErrors.push('Amount is required');
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.push('Amount must be a positive number');
      } else if (amountNum > 999999.99) {
        newErrors.push('Amount cannot exceed $999,999.99');
      }
    }

    if (!description.trim()) {
      newErrors.push('Description is required');
    } else if (description.trim().length < 3) {
      newErrors.push('Description must be at least 3 characters long');
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
      await createTransaction({
        user_id: parseInt(selectedUserId),
        transaction_type: transactionType,
        amount: parseFloat(amount),
        description: description.trim()
      });

      setSuccess(true);
      // Reset form
      setSelectedUserId('');
      setTransactionType('ADD');
      setAmount('');
      setDescription('');
      
      // Reload users to update balances
      await loadUsers();
      
      // Reload user transactions if a user is selected
      if (selectedUserId) {
        await loadUserTransactions(parseInt(selectedUserId));
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (error: any) {
      console.error('Transaction error:', error);
      if (error.response?.data) {
        setErrors([error.response.data]);
      } else {
        setErrors(['Transaction failed. Please try again.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedUserId('');
    setTransactionType('ADD');
    setAmount('');
    setDescription('');
    setErrors([]);
    setSuccess(false);
    setUserTransactions([]);
  };

  const getSelectedUser = (): User | null => {
    if (!selectedUserId) return null;
    return users.find(user => user.id === parseInt(selectedUserId)) || null;
  };

  const selectedUser = getSelectedUser();

  if (loading) {
    return (
      <>
        <AdminHeaderBar />
        <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginTop: '50px' }}>
            <p>Loading users...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeaderBar />
      <main style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>💰 Create Transaction</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Add or subtract money from user accounts</p>
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
            <strong>✅ Success!</strong> Transaction has been processed successfully.
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

        {/* Transaction Form */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            
            {/* User Selection */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Select User *
              </label>
              <select
                name="selectedUserId"
                value={selectedUserId}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #bdc3c7',
                  borderRadius: '5px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
                disabled={isSubmitting}
              >
                <option value="">-- Select a user --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email}) - Balance: ${user.balance?.toFixed(2) || '0.00'}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div style={{
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #3498db',
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>Selected User:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
                  <strong>Name:</strong>
                  <span>{selectedUser.first_name} {selectedUser.last_name}</span>
                  
                  <strong>Email:</strong>
                  <span>{selectedUser.email}</span>
                  
                  <strong>Current Balance:</strong>
                  <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                    ${selectedUser.balance?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            )}

            {/* Transaction Type and Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Transaction Type *
                </label>
                <select
                  name="transactionType"
                  value={transactionType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '5px',
                    fontSize: '14px',
                    backgroundColor: transactionType === 'ADD' ? '#e8f5e8' : '#fdeaea'
                  }}
                  disabled={isSubmitting}
                >
                  <option value="ADD">➕ Add Money</option>
                  <option value="SUBTRACT">➖ Subtract Money</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Amount ($) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={amount}
                  onChange={handleInputChange}
                  min="0.01"
                  max="999999.99"
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

            {/* New Balance Preview */}
            {selectedUser && amount && !isNaN(parseFloat(amount)) && (
              <div style={{
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: transactionType === 'ADD' ? '#e8f5e8' : '#fdeaea',
                border: `1px solid ${transactionType === 'ADD' ? '#27ae60' : '#e74c3c'}`,
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>Transaction Preview:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
                  <strong>Current Balance:</strong>
                  <span>${selectedUser.balance?.toFixed(2) || '0.00'}</span>
                  
                  <strong>Transaction:</strong>
                  <span style={{ color: transactionType === 'ADD' ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                    {transactionType === 'ADD' ? '+' : '-'}${parseFloat(amount).toFixed(2)}
                  </span>
                  
                  <strong>New Balance:</strong>
                  <span style={{ 
                    color: '#2c3e50', 
                    fontWeight: 'bold', 
                    fontSize: '16px' 
                  }}>
                    ${((selectedUser.balance || 0) + (transactionType === 'ADD' ? parseFloat(amount) : -parseFloat(amount))).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={description}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #bdc3c7',
                  borderRadius: '5px',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                placeholder="Enter transaction description (e.g., 'Payment for booking #123', 'Refund for cancelled appointment', etc.)"
                disabled={isSubmitting}
              />
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                Minimum 3 characters required
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
                  backgroundColor: isSubmitting ? '#bdc3c7' : (transactionType === 'ADD' ? '#27ae60' : '#e74c3c'),
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
                    e.currentTarget.style.backgroundColor = transactionType === 'ADD' ? '#229954' : '#c0392b';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = transactionType === 'ADD' ? '#27ae60' : '#e74c3c';
                  }
                }}
              >
                {isSubmitting ? '⏳ Processing...' : `💰 ${transactionType === 'ADD' ? 'Add' : 'Subtract'} Money`}
              </button>
            </div>
          </form>
        </div>

        {/* User Transaction History */}
        {selectedUser && (
          <div style={{
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #dee2e6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Transaction History for {selectedUser.first_name} {selectedUser.last_name}
            </h3>
            
            {loadingTransactions ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                Loading transaction history...
              </div>
            ) : userTransactions.length > 0 ? (
              <div>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <strong>Total Transactions: {userTransactions.length}</strong>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '5px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          borderBottom: '1px solid #dee2e6',
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          fontSize: '14px'
                        }}>
                          ID
                        </th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          borderBottom: '1px solid #dee2e6',
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          fontSize: '14px'
                        }}>
                          Type
                        </th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          borderBottom: '1px solid #dee2e6',
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          fontSize: '14px'
                        }}>
                          Amount
                        </th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          borderBottom: '1px solid #dee2e6',
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          fontSize: '14px'
                        }}>
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.map((transaction, index) => (
                        <tr key={transaction.id} style={{ 
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                          borderBottom: '1px solid #dee2e6'
                        }}>
                          <td style={{ 
                            padding: '10px 12px', 
                            fontSize: '13px',
                            color: '#7f8c8d'
                          }}>
                            #{transaction.id}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: '#fff',
                              backgroundColor: transaction.transaction_type === 'ADD' ? '#27ae60' : '#e74c3c'
                            }}>
                              {transaction.transaction_type === 'ADD' ? '➕ ADD' : '➖ SUBTRACT'}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '10px 12px',
                            fontWeight: 'bold',
                            color: transaction.transaction_type === 'ADD' ? '#27ae60' : '#e74c3c'
                          }}>
                            {transaction.transaction_type === 'ADD' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </td>
                          <td style={{ 
                            padding: '10px 12px',
                            fontSize: '13px',
                            color: '#2c3e50'
                          }}>
                            {transaction.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px',
                color: '#7f8c8d',
                fontStyle: 'italic'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
                No transactions found for this user.
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <strong>💡 Transaction Guidelines:</strong>
          <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
            <li>Select a user from the dropdown to see their current balance</li>
            <li>Choose "Add Money" to increase their balance or "Subtract Money" to decrease it</li>
            <li>Enter the amount you want to add or subtract</li>
            <li>Provide a clear description for the transaction record</li>
            <li>Review the transaction preview before submitting</li>
            <li>The new balance will be updated immediately after processing</li>
          </ul>
        </div>
      </main>
    </>
  );
};

export default AdminTransaction;