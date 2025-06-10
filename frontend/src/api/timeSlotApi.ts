// src/api/timeSlotApi.ts
import axios from 'axios';

export interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: number | null;
}

const API_URL = 'http://localhost:8080/api/time-slots';

export async function getMyTimeSlots(): Promise<TimeSlot[]> {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get<TimeSlot[]>(`${API_URL}/my`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function getFreeTimeSlots(days = 7): Promise<TimeSlot[]> {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get<TimeSlot[]>(`${API_URL}/free?days=${days}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function addTimeSlot(date: string, start_time: string, end_time: string) {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.post(API_URL, {
    date, start_time, end_time
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}