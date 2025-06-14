import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';  // <-- dodaj ovo
import './api/axiosConfig';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>      {/* <-- wrapaj App u AuthProvider */}
      <App />
    </AuthProvider>
  </StrictMode>,
);
