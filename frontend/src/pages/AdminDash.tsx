import React, { useEffect, useState } from 'react';
import AdminHeaderBar from '../components/AdminHeaderBar';
import Footer from '../components/Footer';
import { getMyTimeSlots, getAllTimeSlots, addTimeSlot, deleteTimeSlot } from '../api/timeSlotApi';

interface TimeSlot {
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

interface DateInfo {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
}

const AdminDash: React.FC = () => {
  const [mySlots, setMySlots] = useState<TimeSlot[]>([]);
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('');
  const [newSlotEndTime, setNewSlotEndTime] = useState('');
  const [addingSlot, setAddingSlot] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<number | null>(null);

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
    // Set default date for new slot to today
    const today = new Date().toISOString().split('T')[0];
    setNewSlotDate(today);
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const [my, all] = await Promise.all([
        getMyTimeSlots(),
        getAllTimeSlots(7) // Changed from getFreeTimeSlots to getAllTimeSlots
      ]);
      setMySlots(my);
      setAllSlots(all);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
  };

  const handleDeleteTimeSlot = async (slotId: number) => {
    if (!confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    setDeletingSlot(slotId);
    try {
      await deleteTimeSlot(slotId);
      await loadSlots(); // Refresh data
      alert('Time slot deleted successfully!');
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Failed to delete time slot. Please try again.');
    } finally {
      setDeletingSlot(null);
    }
  };

  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSlotDate || !newSlotStartTime || !newSlotEndTime) {
      alert('Please fill in all fields');
      return;
    }

    // Validate time format and logic
    if (newSlotStartTime >= newSlotEndTime) {
      alert('End time must be after start time');
      return;
    }

    setAddingSlot(true);
    try {
      await addTimeSlot(newSlotDate, newSlotStartTime, newSlotEndTime);
      await loadSlots(); // Refresh data
      setShowAddSlotModal(false);
      // Reset form
      setNewSlotStartTime('');
      setNewSlotEndTime('');
      alert('Time slot added successfully!');
    } catch (error) {
      console.error('Error adding time slot:', error);
      alert('Failed to add time slot. Please try again.');
    } finally {
      setAddingSlot(false);
    }
  };

  const getSlotsForDate = (dateString: string): TimeSlot[] => {
    return allSlots.filter(slot => slot.date === dateString);
  };

  const getMySlotCount = (dateString: string): number => {
    return mySlots.filter(slot => slot.date === dateString).length;
  };

  const getTotalSlotsForDate = (dateString: string): number => {
    return getSlotsForDate(dateString).length;
  };

  // Generate time options for the dropdown
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 5; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 22) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <>
      <AdminHeaderBar />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Admin Header with Add Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <div>
            <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Admin Dashboard</h1>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Manage time slots and view bookings</p>
          </div>
          <button
            onClick={() => setShowAddSlotModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#27ae60',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(39, 174, 96, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#229954'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
          >
            + Add Time Slot
          </button>
        </div>

        {/* My Created Slots Summary */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>My Created Slots</h2>
          {mySlots.length > 0 ? (
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #27ae60'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#27ae60' }}>
                You have created {mySlots.length} slot{mySlots.length !== 1 ? 's' : ''}:
              </p>
              {mySlots.map(slot => (
                <div key={slot.id} style={{ 
                  marginBottom: '5px', 
                  padding: '5px 0',
                  borderBottom: '1px solid #c8e6c9'
                }}>
                  <strong>{slot.date}</strong> at {slot.start_time} - {slot.end_time}
                  <span style={{ 
                    marginLeft: '10px', 
                    fontSize: '12px',
                    color: slot.is_booked ? '#e74c3c' : '#27ae60',
                    fontWeight: 'bold'
                  }}>
                    ({slot.is_booked ? 'Booked' : 'Available'})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
              No slots created yet. Click "Add Time Slot" to create your first slot.
            </p>
          )}
        </div>

        {/* 7 Day Overview */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Weekly Overview</h2>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {next7Days.map((dayInfo) => {
              const mySlotCount = getMySlotCount(dayInfo.dateString);
              const totalSlots = getTotalSlotsForDate(dayInfo.dateString);
              
              return (
                <button
                  key={dayInfo.dateString}
                  onClick={() => handleDateClick(dayInfo.dateString)}
                  style={{
                    padding: '15px 20px',
                    border: selectedDate === dayInfo.dateString ? '3px solid #3498db' : '2px solid #bdc3c7',
                    borderRadius: '10px',
                    backgroundColor: mySlotCount > 0 ? '#e8f5e8' : (totalSlots > 0 ? '#fff' : '#f8f9fa'),
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
                  {mySlotCount > 0 && (
                    <div style={{ fontSize: '10px', color: '#27ae60', fontWeight: 'bold' }}>
                      MY SLOTS: {mySlotCount}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '5px' }}>
                    Total: {totalSlots} slot{totalSlots !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots for Selected Date */}
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
                All Time Slots for {selectedDate}
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
              <p>Loading time slots...</p>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {getSlotsForDate(selectedDate).map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      padding: '15px',
                      backgroundColor: '#fff',
                      border: slot.is_booked ? '2px solid #e74c3c' : '2px solid #27ae60',
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
                      color: slot.is_booked ? '#e74c3c' : '#27ae60',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {slot.is_booked ? '🔴 BOOKED' : '🟢 AVAILABLE'}
                    </div>
                    
                    {/* Show booked by user info if available */}
                    {slot.is_booked && slot.booked_by_user && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#34495e',
                        marginBottom: '8px',
                        padding: '5px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                          Booked by:
                        </div>
                        <div>
                          {slot.booked_by_user.first_name} {slot.booked_by_user.last_name}
                        </div>
                        <div style={{ color: '#7f8c8d', fontSize: '10px' }}>
                          {slot.booked_by_user.email}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '10px' }}>
                      Slot ID: {slot.id}
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTimeSlot(slot.id)}
                      disabled={deletingSlot === slot.id}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: deletingSlot === slot.id ? '#bdc3c7' : '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deletingSlot === slot.id ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        width: '100%',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (deletingSlot !== slot.id) {
                          e.currentTarget.style.backgroundColor = '#c0392b';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (deletingSlot !== slot.id) {
                          e.currentTarget.style.backgroundColor = '#e74c3c';
                        }
                      }}
                    >
                      {deletingSlot === slot.id ? 'Deleting...' : '🗑️ Delete Slot'}
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
                    No time slots created for this date yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Time Slot Modal */}
        {showAddSlotModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              minWidth: '400px',
              maxWidth: '500px'
            }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>
                Add New Time Slot
              </h3>
              
              <form onSubmit={handleAddTimeSlot}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                    Date:
                  </label>
                  <input
                    type="date"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #bdc3c7',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                    Start Time:
                  </label>
                  <select
                    value={newSlotStartTime}
                    onChange={(e) => setNewSlotStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #bdc3c7',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select start time</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                    End Time:
                  </label>
                  <select
                    value={newSlotEndTime}
                    onChange={(e) => setNewSlotEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #bdc3c7',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select end time</option>
                    {timeOptions.filter(time => time > newSlotStartTime).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddSlotModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#95a5a6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    disabled={addingSlot}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingSlot}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: addingSlot ? '#bdc3c7' : '#27ae60',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: addingSlot ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {addingSlot ? 'Adding...' : 'Add Time Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AdminDash;