import axios from 'axios';

export interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: number | null;
  booked_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

const API_URL = `${import.meta.env.VITE_API_URL}/api/time-slots`;

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

export async function bookTimeSlot(slotId: number): Promise<void> {
  const token = localStorage.getItem('jwtToken');
  await axios.post(`${API_URL}/book/${slotId}`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function deleteTimeSlot(slotId: number): Promise<void> {
  const token = localStorage.getItem('jwtToken');
  await axios.delete(`${API_URL}/${slotId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function getAllTimeSlots(days = 7): Promise<TimeSlot[]> {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get<TimeSlot[]>(`${API_URL}/all?days=${days}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function unbookTimeSlot(slotId: number): Promise<void> {
  const token = localStorage.getItem('jwtToken');
  await axios.post(`${API_URL}/unbook/${slotId}`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
