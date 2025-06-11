import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

interface JWTResponse {
  token: string;
}

export async function login(email: string, password: string): Promise<string> {
  const response = await axios.post<JWTResponse>(`${API_URL}/login`, { email, password });
  const token = response.data.token;
  localStorage.setItem('jwtToken', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return token;
}

export function logout() {
  localStorage.removeItem('jwtToken');
  delete axios.defaults.headers.common['Authorization'];
}

export function getToken(): string | null {
  return localStorage.getItem('jwtToken');
}

export async function adminRegisterUser(userData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  balance: number;
}): Promise<void> {
  const token = localStorage.getItem('jwtToken');
  await axios.post(`${API_URL}/admin/register`, userData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await axios.post<string>(`${API_URL}/forgot-password`, { email });
  return response.data;
}

export async function resetPassword(token: string, newPassword: string): Promise<string> {
  const response = await axios.post<string>(`${API_URL}/reset-password`, { token, newPassword });
  return response.data;
}