import React, { useEffect, useState } from 'react';
import UserHeaderBar from '../components/UserHeaderBar';
import { getFreeTimeSlots, getMyTimeSlots, bookTimeSlot, unbookTimeSlot } from '../api/timeSlotApi';

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
  const [freeSlots, setFreeSlots] = useState<TimeSlot[]>([]);
  const [myBookings, setMyBookings] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<number | null>(null);
  const [unbookingSlot, setUnbookingSlot] = useState<number | null>(null);

  // Generate next 7 days starting from today
  const generateNext7Days = (): DateInfo[] => {
    const days: DateInfo[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      days.push({
        date: date,
        dateString: date.toISOString().split('T')[0],
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
      const [free, my] = await Promise.all([
        getFreeTimeSlots(7),
        getMyTimeSlots()
      ]);
      setFreeSlots(free);
      setMyBookings(my);
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
    if (!confirm('Are you sure you want to book this time slot?')) {
      return;
    }

    setBookingSlot(slotId);
    try {
      await bookTimeSlot(slotId);
      await loadSlots(); // Refresh data
      alert('Time slot booked successfully!');
    } catch (error) {
      console.error('Error booking time slot:', error);
      alert('Failed to book time slot. Please try again.');
    } finally {
      setBookingSlot(null);
    }
  };

  const handleUnbookSlot = async (slotId: number) => {
    if (!confirm('Are you sure you want to unbook this time slot? This action cannot be undone.')) {
      return;
    }

    setUnbookingSlot(slotId);
    try {
      await unbookTimeSlot(slotId);
      await loadSlots(); // Refresh data
      alert('Time slot unbooked successfully!');
    } catch (error) {
      console.error('Error unbooking time slot:', error);
      alert('Failed to unbook time slot. Please try again.');
    } finally {
      setUnbookingSlot(null);
    }
  };

  const getFreeSlotsForDate = (dateString: string): TimeSlot[] => {
    return freeSlots.filter(slot => slot.date === dateString);
  };

  const getMyBookingsForDate = (dateString: string): TimeSlot[] => {
    return myBookings.filter(slot => slot.date === dateString);
  };

  const getFreeSlotsCount = (dateString: string): number => {
    return getFreeSlotsForDate(dateString).length;
  };

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return myBookings.filter(booking => booking.date >= today);
  };

  const upcomingBookings = getUpcomingBookings();

  return (
    <>
      <UserHeaderBar />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* User Header */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>User Dashboard</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Book available time slots and manage your bookings</p>
        </div>

        {/* My Upcoming Bookings Summary */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>My Upcoming Bookings</h2>
          {upcomingBookings.length > 0 ? (
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #3498db'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#3498db' }}>
                You have {upcomingBookings.length} upcoming booking{upcomingBookings.length !== 1 ? 's' : ''}:
              </p>
              {upcomingBookings.slice(0, 3).map(booking => (
                <div key={booking.id} style={{ 
                  marginBottom: '10px', 
                  padding: '10px',
                  borderBottom: upcomingBookings.indexOf(booking) < 2 ? '1px solid #bbdefb' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{booking.date}</strong> at {booking.start_time} - {booking.end_time}
                    <span style={{ 
                      marginLeft: '10px', 
                      fontSize: '12px',
                      color: '#27ae60',
                      fontWeight: 'bold'
                    }}>
                      ✓ Confirmed
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnbookSlot(booking.id)}
                    disabled={unbookingSlot === booking.id}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: unbookingSlot === booking.id ? '#bdc3c7' : '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: unbookingSlot === booking.id ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {unbookingSlot === booking.id ? 'Unbooking...' : '❌ Unbook'}
                  </button>
                </div>
              ))}
              {upcomingBookings.length > 3 && (
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#7f8c8d' }}>
                  And {upcomingBookings.length - 3} more... View all in your profile.
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
              No upcoming bookings. Browse available slots below to make a booking.
            </p>
          )}
        </div>

        {/* 7 Day Overview */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Available Slots - Next 7 Days</h2>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {next7Days.map((dayInfo) => {
              const freeSlotsCount = getFreeSlotsCount(dayInfo.dateString);
              const myBookingsCount = getMyBookingsForDate(dayInfo.dateString).length;
              
              return (
                <button
                  key={dayInfo.dateString}
                  onClick={() => handleDateClick(dayInfo.dateString)}
                  style={{
                    padding: '15px 20px',
                    border: selectedDate === dayInfo.dateString ? '3px solid #3498db' : '2px solid #bdc3c7',
                    borderRadius: '10px',
                    backgroundColor: myBookingsCount > 0 ? '#e3f2fd' : (freeSlotsCount > 0 ? '#fff' : '#f8f9fa'),
                    cursor: 'pointer',
                    textAlign: 'center',
                    minWidth: '120px',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedDate === dayInfo.dateString ? '0 4px 8px rgba(52, 152, 219, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
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
                  {myBookingsCount > 0 && (
                    <div style={{ fontSize: '10px', color: '#3498db', fontWeight: 'bold' }}>
                      MY BOOKINGS: {myBookingsCount}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '5px' }}>
                    Available: {freeSlotsCount} slot{freeSlotsCount !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Slots for Selected Date */}
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
                Available Slots for {selectedDate}
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
              <p>Loading available slots...</p>
            ) : (
              <div>
                {/* My Bookings for this date */}
                {getMyBookingsForDate(selectedDate).length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ color: '#3498db', marginBottom: '15px' }}>🎯 Your Bookings for this Date</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '15px'
                    }}>
                      {getMyBookingsForDate(selectedDate).map((booking) => (
                        <div
                          key={booking.id}
                          style={{
                            padding: '15px',
                            backgroundColor: '#e3f2fd',
                            border: '2px solid #3498db',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
                            {booking.start_time} - {booking.end_time}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#3498db',
                            fontWeight: 'bold',
                            marginBottom: '8px'
                          }}>
                            🎯 YOUR BOOKING
                          </div>
                          <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '10px' }}>
                            Booking ID: {booking.id}
                          </div>
                          
                          {/* Unbook Button */}
                          <button
                            onClick={() => handleUnbookSlot(booking.id)}
                            disabled={unbookingSlot === booking.id}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: unbookingSlot === booking.id ? '#bdc3c7' : '#e74c3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: unbookingSlot === booking.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              width: '100%',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              if (unbookingSlot !== booking.id) {
                                e.currentTarget.style.backgroundColor = '#c0392b';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (unbookingSlot !== booking.id) {
                                e.currentTarget.style.backgroundColor = '#e74c3c';
                              }
                            }}
                          >
                            {unbookingSlot === booking.id ? 'Unbooking...' : '❌ Unbook This Slot'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available slots */}
                <h4 style={{ color: '#27ae60', marginBottom: '15px' }}>🟢 Available Slots</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '15px'
                }}>
                  {getFreeSlotsForDate(selectedDate).map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        padding: '15px',
                        backgroundColor: '#fff',
                        border: '2px solid #27ae60',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#27ae60',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        🟢 AVAILABLE
                      </div>
                      
                      <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '10px' }}>
                        Slot ID: {slot.id}
                      </div>
                      
                      {/* Book Button */}
                      <button
                        onClick={() => handleBookSlot(slot.id)}
                        disabled={bookingSlot === slot.id}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: bookingSlot === slot.id ? '#bdc3c7' : '#27ae60',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: bookingSlot === slot.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          width: '100%',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          if (bookingSlot !== slot.id) {
                            e.currentTarget.style.backgroundColor = '#229954';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (bookingSlot !== slot.id) {
                            e.currentTarget.style.backgroundColor = '#27ae60';
                          }
                        }}
                      >
                        {bookingSlot === slot.id ? 'Booking...' : '📅 Book This Slot'}
                      </button>
                    </div>
                  ))}
                  
                  {getFreeSlotsForDate(selectedDate).length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#7f8c8d', 
                      fontStyle: 'italic',
                      gridColumn: '1 / -1',
                      padding: '20px'
                    }}>
                      No available slots for this date.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Booking Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#3498db',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {myBookings.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Bookings</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#27ae60',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(39, 174, 96, 0.3)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {upcomingBookings.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Upcoming</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#f39c12',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(243, 156, 18, 0.3)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {freeSlots.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Available Slots</div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UserDash;