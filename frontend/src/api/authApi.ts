import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

interface JWTResponse {
  token: string;
}

export async function login(username: string, password: string): Promise<string> {
  const response = await axios.post<JWTResponse>(`${API_URL}/login`, { username, password });
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
