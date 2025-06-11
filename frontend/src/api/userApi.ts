// src/api/userApi.ts
import axios from 'axios';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  balance?: number;
  role: string;
  created_at?: string;
}

const backendUrl = (window as any)?.env?.VITE_BACKEND_URL || '';
const API_URL = `${backendUrl}/api/users`;

export async function getAllUsers(): Promise<User[]> {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get<User[]>(`${API_URL}/all`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function getUserProfile(): Promise<User> {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get<User>(`${API_URL}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function updateUserProfile(userData: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}): Promise<void> {
  const token = localStorage.getItem('jwtToken');
  await axios.put(`${API_URL}/profile`, userData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

export async function resetUserPassword(userId: number, newPassword: string): Promise<void> {
  const token = localStorage.getItem('jwtToken');
  await axios.put(`${API_URL}/admin/reset-password`, {
    user_id: userId,
    new_password: newPassword
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}