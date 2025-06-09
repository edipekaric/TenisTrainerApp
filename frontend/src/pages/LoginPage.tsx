import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext'; // <-- ovo dodaj!
import '../styles/nicepage.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth(); // <-- hook za login

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password); // <--- POVEŽI SE S APIJEM
      setError(null);
      alert('Login uspješan!');
      // Možeš ovdje redirect npr. na /dashboard
    } catch (err) {
      console.error(err);
      setError('Login neuspješan. Provjerite email i lozinku.');
    }
  };

  return (
    <div className="u-body u-xl-mode">
      <Header />

      <main
        style={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '40px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '20px' }}>Log In</h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '10px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Zaboravljena sifra */}
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <a
                href="#"
                style={{
                  fontSize: '0.9rem',
                  color: '#478ac9',
                  textDecoration: 'none',
                }}
              >
                Zaboravljena sifra
              </a>
            </div>

            {/* Error prikaz */}
            {error && (
              <div style={{ color: 'red', marginBottom: '15px' }}>
                {error}
              </div>
            )}

            {/* Log In Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#478ac9',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Log In
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
