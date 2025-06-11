// src/api/transactionApi.ts

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: 'ADD' | 'SUBTRACT';
  description: string;
  created_at?: string;
  user_name?: string;
}

export async function createTransaction(transactionData: {
  user_id: number;
  transaction_type: 'ADD' | 'SUBTRACT';
  amount: number;
  description: string;
}): Promise<void> {
  const token = localStorage.getItem('jwtToken');
  await axios.post(`${API_URL}/create`, transactionData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get(`${API_URL}/all`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data as Transaction[];
}

export async function getUserTransactions(userId: number): Promise<Transaction[]> {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get(`${API_URL}/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data as Transaction[];
}
