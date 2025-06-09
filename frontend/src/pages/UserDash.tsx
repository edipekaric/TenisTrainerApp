import React, { useEffect, useState } from 'react';
import HeaderBar from '../components/HeaderBar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getMyTimeSlots, getFreeTimeSlots } from '../api/timeSlotApi';

interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: number | null;
}

const UserDash: React.FC = () => {
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

  return (
    <>
      <HeaderBar />
      <main style={{ padding: '20px' }}>
        <h2>My Booked Slots</h2>
        <Calendar
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const slotForDay = mySlots.filter((slot: TimeSlot) => slot.date === date.toISOString().split('T')[0]);
              return slotForDay.length > 0 ? <p style={{ color: 'green' }}>Booked</p> : null;
            }
          }}
        />

        <h2 style={{ marginTop: '30px' }}>Free Slots (Next 7 Days)</h2>
        <ul>
          {freeSlots.map((slot: TimeSlot) => (
            <li key={slot.id}>
              {slot.date} {slot.start_time} - {slot.end_time}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default UserDash;
