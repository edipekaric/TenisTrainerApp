import React, { useEffect, useState } from 'react';
import HeaderBar from '../components/HeaderBar';
import { getMyTimeSlots, getFreeTimeSlots, bookTimeSlot } from '../api/timeSlotApi';

interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: number | null;
}

interface DateInfo {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
}

const UserDash: React.FC = () => {
  const [mySlots, setMySlots] = useState<TimeSlot[]>([]);
  const [freeSlots, setFreeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);

  // Generate next 7 days starting from today
  const generateNext7Days = (): DateInfo[] => {
    const days: DateInfo[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      days.push({
        date: date,
        dateString: date.toISOString().split('T')[0], // YYYY-MM-DD format
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0
      });
    }
    return days;
  };

  const [next7Days] = useState<DateInfo[]>(generateNext7Days());

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const [my, free] = await Promise.all([
        getMyTimeSlots(),
        getFreeTimeSlots(7)
      ]);
      setMySlots(my);
      setFreeSlots(free);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
  };

  const handleBookSlot = async (slotId: number) => {
    setBookingLoading(slotId);
    try {
      await bookTimeSlot(slotId);
      await loadSlots(); // Refresh data after booking
      setSelectedDate(null); // Close the time slots view
    } catch (error) {
      console.error('Error booking slot:', error);
      alert('Failed to book slot. Please try again.');
    } finally {
      setBookingLoading(null);
    }
  };

  const getSlotsForDate = (dateString: string): TimeSlot[] => {
    return freeSlots.filter(slot => slot.date === dateString);
  };

  const getMySlotCount = (dateString: string): number => {
    return mySlots.filter(slot => slot.date === dateString).length;
  };

  return (
    <>
      <HeaderBar />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* My Booked Slots Summary */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>My Bookings</h2>
          {mySlots.length > 0 ? (
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #27ae60'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#27ae60' }}>
                You have {mySlots.length} upcoming booking{mySlots.length !== 1 ? 's' : ''}:
              </p>
              {mySlots.map(slot => (
                <div key={slot.id} style={{ 
                  marginBottom: '5px', 
                  padding: '5px 0',
                  borderBottom: '1px solid #c8e6c9'
                }}>
                  <strong>{slot.date}</strong> at {slot.start_time} - {slot.end_time}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
              No upcoming bookings. Select a date below to book a session.
            </p>
          )}
        </div>

        {/* 7 Day Date Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Book a Session</h2>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {next7Days.map((dayInfo) => {
              const hasBooking = getMySlotCount(dayInfo.dateString) > 0;
              const availableSlots = getSlotsForDate(dayInfo.dateString).length;
              
              return (
                <button
                  key={dayInfo.dateString}
                  onClick={() => handleDateClick(dayInfo.dateString)}
                  style={{
                    padding: '15px 20px',
                    border: selectedDate === dayInfo.dateString ? '3px solid #3498db' : '2px solid #bdc3c7',
                    borderRadius: '10px',
                    backgroundColor: hasBooking ? '#e8f5e8' : (availableSlots > 0 ? '#fff' : '#f8f9fa'),
                    cursor: availableSlots > 0 ? 'pointer' : 'not-allowed',
                    textAlign: 'center',
                    minWidth: '120px',
                    opacity: availableSlots > 0 ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    boxShadow: selectedDate === dayInfo.dateString ? '0 4px 8px rgba(52, 152, 219, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  disabled={availableSlots === 0}
                >
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>
                    {dayInfo.dayName}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                    {dayInfo.dayNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>
                    {dayInfo.monthName}
                  </div>
                  {dayInfo.isToday && (
                    <div style={{ fontSize: '10px', color: '#e74c3c', fontWeight: 'bold' }}>
                      TODAY
                    </div>
                  )}
                  {hasBooking && (
                    <div style={{ fontSize: '10px', color: '#27ae60', fontWeight: 'bold' }}>
                      BOOKED
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '5px' }}>
                    {availableSlots} slot{availableSlots !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Time Slots for Selected Date */}
        {selectedDate && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#2c3e50', margin: 0 }}>
                Available Times for {selectedDate}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#7f8c8d'
                }}
              >
                ✕
              </button>
            </div>
            
            {loading ? (
              <p>Loading available times...</p>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {getSlotsForDate(selectedDate).map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      backgroundColor: '#fff',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        Available
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={bookingLoading === slot.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: bookingLoading === slot.id ? '#bdc3c7' : '#27ae60',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: bookingLoading === slot.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {bookingLoading === slot.id ? 'Booking...' : 'Book'}
                    </button>
                  </div>
                ))}
                
                {getSlotsForDate(selectedDate).length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#7f8c8d', 
                    fontStyle: 'italic',
                    gridColumn: '1 / -1',
                    padding: '20px'
                  }}>
                    No available time slots for this date.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default UserDash;