import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { forgotPassword } from '../api/authApi';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await forgotPassword(email);
      setMessage(result);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="u-body u-xl-mode">
      <Header />
      <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px' }}>Zaboravljena šifra</h2>
          
          {message ? (
            <div style={{ padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px', color: '#155724', marginBottom: '20px' }}>
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Unesite vašu email adresu da biste dobili link za resetovanje šifre.
              </p>
              
              <input
                type="email"
                placeholder="Email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {loading ? 'Šalje se...' : 'Pošalji link'}
              </button>
            </form>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <a href="/login" style={{ color: '#478ac9', textDecoration: 'none' }}>
              ← Nazad na login
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;