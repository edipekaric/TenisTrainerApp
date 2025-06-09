import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getToken } from '../api/authApi';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  const login = async (username: string, password: string) => {
    await apiLogin(username, password);
    setIsAuthenticated(true);
  };

  const logout = () => {
    apiLogout();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
