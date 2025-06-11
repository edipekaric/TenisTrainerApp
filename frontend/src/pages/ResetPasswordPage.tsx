import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { resetPassword } from '../api/authApi';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Šifre se ne poklapaju');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Šifra mora imati najmanje 6 karaktera');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await resetPassword(token!, newPassword);
      alert('Šifra je uspešno promenjena! Možete se sada prijaviti.');
      navigate('/login');
    } catch (err) {
      setError('Greška pri promeni šifre. Token je možda istekao.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="u-body u-xl-mode">
      <Header />
      <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px' }}>Nova šifra</h2>
          
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Nova šifra"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '15px' }}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              placeholder="Potvrdite šifru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '15px' }}
              required
              disabled={loading}
            />
            
            {error && (
              <div style={{ color: 'red', marginBottom: '15px' }}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#bdc3c7' : '#478ac9', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Menja se...' : 'Promeni šifru'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;