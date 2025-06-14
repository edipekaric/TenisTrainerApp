import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AdminDash from './pages/AdminDash';
import UserDash from './pages/UserDash';
import AdminAllUsers from './pages/AdminAllUsers';
import UserProfile from './pages/UserProfile';
import AdminRegisterUser from './pages/AdminRegisterUser';
import AdminTransaction from './pages/AdminTransaction';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

  
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-dash" element={<AdminDash />} />
        <Route path="/user-dash" element={<UserDash />} />
        <Route path="/admin/users" element={<AdminAllUsers />} /> 
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/admin/register-user" element={<AdminRegisterUser />} />
        <Route path="/admin/transaction" element={<AdminTransaction />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
};

export default App;
