// src/pages/AdminDash.tsx

import React, { useEffect, useState } from 'react';
import HeaderBar from '../components/HeaderBar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getMyTimeSlots, getFreeTimeSlots, addTimeSlot } from '../api/timeSlotApi';
import type { TimeSlot } from '../api/timeSlotApi';

const AdminDash: React.FC = () => {
  const [mySlots, setMySlots] = useState<TimeSlot[]>([]);
  const [freeSlots, setFreeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const my = await getMyTimeSlots();
    const free = await getFreeTimeSlots();
    setMySlots(my);
    setFreeSlots(free);
  };

  const handleAddSlot = async () => {
    // Example → add slot for today + 1h
    const today = new Date().toISOString().split('T')[0];
    await addTimeSlot(today, '10:00', '11:00');
    await loadSlots();
  };

  return (
    <>
      <HeaderBar />
      <main style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Booked Slots</h2>
          <button onClick={handleAddSlot} style={{
            padding: '8px 12px',
            backgroundColor: '#27ae60',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
          }}>
            Add a Time Slot
          </button>
        </div>

        <Calendar
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const slotForDay = mySlots.filter((slot: any) => slot.date === date.toISOString().split('T')[0]);
              return slotForDay.length > 0 ? <p style={{ color: 'green' }}>Booked</p> : null;
            }
          }}
        />

        <h2 style={{ marginTop: '30px' }}>Free Slots (Next 7 Days)</h2>
        <ul>
          {freeSlots.map((slot: any) => (
            <li key={slot.id}>
              {slot.date} {slot.start_time} - {slot.end_time}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default AdminDash;
