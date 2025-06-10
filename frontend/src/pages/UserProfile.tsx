import React, { useEffect, useState } from 'react';
import UserHeaderBar from '../components/UserHeaderBar';
import { getUserProfile, updateUserProfile } from '../api/userApi';
import { getMyTimeSlots, unbookTimeSlot } from '../api/timeSlotApi';
import Footer from '../components/Footer';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  balance?: number;
  role: string;
  created_at?: string;
}

interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: number | null;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myBookings, setMyBookings] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [updating, setUpdating] = useState(false);
  const [unbookingSlot, setUnbookingSlot] = useState<number | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [userProfile, bookings] = await Promise.all([
        getUserProfile(),
        getMyTimeSlots()
      ]);
      setProfile(userProfile);
      setMyBookings(bookings);
      setEditForm({
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        email: userProfile.email,
        phone: userProfile.phone || ''
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
      alert('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.first_name.trim() || !editForm.last_name.trim() || !editForm.email.trim()) {
      alert('Please fill in required fields (name and email)');
      return;
    }

    setUpdating(true);
    try {
      await updateUserProfile(editForm);
      await loadProfileData(); // Refresh data
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || ''
    });
  };

  const handleUnbookSlot = async (slotId: number, slotDate: string, slotTime: string) => {
    if (!confirm(`Are you sure you want to unbook your appointment on ${slotDate} at ${slotTime}? This action cannot be undone.`)) {
      return;
    }

    setUnbookingSlot(slotId);
    try {
      await unbookTimeSlot(slotId);
      await loadProfileData(); // Refresh data to update the bookings list
      alert('Appointment unbooked successfully!');
    } catch (error) {
      console.error('Error unbooking slot:', error);
      alert('Failed to unbook appointment. Please try again.');
    } finally {
      setUnbookingSlot(null);
    }
  };

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return myBookings.filter(booking => booking.date >= today);
  };

  const getPastBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return myBookings.filter(booking => booking.date < today);
  };

  if (loading) {
    return (
      <>
        <UserHeaderBar />
        <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '40px', color: '#7f8c8d' }}>
            Loading your profile...
          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <UserHeaderBar />
        <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '40px', color: '#e74c3c' }}>
            Failed to load profile data.
          </div>
        </main>
      </>
    );
  }

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  return (
    <>
      <UserHeaderBar />
      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Profile Header */}
        <div style={{ 
          marginBottom: '30px',
          padding: '25px',
          backgroundColor: '#f8f9fa',
          borderRadius: '15px',
          border: '1px solid #dee2e6',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#3498db',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 auto 15px auto'
          }}>
            {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
          </div>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>
            {profile.first_name} {profile.last_name}
          </h1>
          <p style={{ color: '#7f8c8d', margin: '0 0 15px 0', fontSize: '16px' }}>
            {profile.email}
          </p>
          {profile.balance !== undefined && (
            <p style={{ color: '#27ae60', margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Balance: ${profile.balance?.toFixed(2)}
            </p>
          )}
          <div style={{
            display: 'inline-block',
            padding: '5px 15px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: profile.role === 'ADMIN' ? '#e74c3c' : '#27ae60',
            color: '#fff'
          }}>
            {profile.role}
          </div>
          {profile.created_at && (
            <p style={{ color: '#95a5a6', margin: '10px 0 0 0', fontSize: '14px' }}>
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Profile Information Card */}
        <div style={{ 
          marginBottom: '30px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ color: '#2c3e50', margin: 0 }}>Profile Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3498db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <div style={{ padding: '20px' }}>
            {editing ? (
              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                    First Name:
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
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
                    Last Name:
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
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
                    Phone (optional):
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #bdc3c7',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                    placeholder="Enter phone number"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                    Email:
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
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

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={updating}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: updating ? '#bdc3c7' : '#27ae60',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {updating ? 'Updating...' : '💾 Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={updating}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#95a5a6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '15px', alignItems: 'center' }}>
                <strong style={{ color: '#34495e' }}>User ID:</strong>
                <span style={{ color: '#7f8c8d' }}>#{profile.id}</span>
                
                <strong style={{ color: '#34495e' }}>First Name:</strong>
                <span style={{ color: '#2c3e50' }}>{profile.first_name}</span>
                
                <strong style={{ color: '#34495e' }}>Last Name:</strong>
                <span style={{ color: '#2c3e50' }}>{profile.last_name}</span>
                
                <strong style={{ color: '#34495e' }}>Email:</strong>
                <span style={{ color: '#2c3e50' }}>{profile.email}</span>
                
                <strong style={{ color: '#34495e' }}>Phone:</strong>
                <span style={{ color: '#2c3e50' }}>{profile.phone || 'Not provided'}</span>
                
                <strong style={{ color: '#34495e' }}>Balance:</strong>
                <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  ${profile.balance?.toFixed(2) || '0.00'}
                </span>
                
                <strong style={{ color: '#34495e' }}>Role:</strong>
                <span style={{ color: '#2c3e50' }}>{profile.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#3498db',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center'
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
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {upcomingBookings.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Upcoming</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#95a5a6',
            color: '#fff',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {pastBookings.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Completed</div>
          </div>
        </div>

        {/* My Bookings */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6'
          }}>
            <h2 style={{ color: '#2c3e50', margin: 0 }}>My Bookings</h2>
          </div>

          <div style={{ padding: '20px' }}>
            {myBookings.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#7f8c8d', 
                fontStyle: 'italic',
                padding: '20px'
              }}>
                You haven't made any bookings yet.
              </div>
            ) : (
              <>
                {upcomingBookings.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>🔜 Upcoming Bookings</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {upcomingBookings.map(booking => (
                        <div
                          key={booking.id}
                          style={{
                            padding: '15px',
                            backgroundColor: '#e8f5e8',
                            border: '1px solid #27ae60',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ color: '#2c3e50' }}>{booking.date}</strong>
                            <span style={{ marginLeft: '10px', color: '#7f8c8d' }}>
                              {booking.start_time} - {booking.end_time}
                            </span>
                            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '3px' }}>
                              Booking ID: #{booking.id}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: '#27ae60',
                              color: '#fff'
                            }}>
                              Confirmed
                            </div>
                            <button
                              onClick={() => handleUnbookSlot(booking.id, booking.date, `${booking.start_time} - ${booking.end_time}`)}
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
                              {unbookingSlot === booking.id ? '⏳ Unbooking...' : '❌ Unbook'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pastBookings.length > 0 && (
                  <div>
                    <h3 style={{ color: '#95a5a6', marginBottom: '15px' }}>📅 Past Bookings</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {pastBookings.map(booking => (
                        <div
                          key={booking.id}
                          style={{
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ color: '#2c3e50' }}>{booking.date}</strong>
                            <span style={{ marginLeft: '10px', color: '#7f8c8d' }}>
                              {booking.start_time} - {booking.end_time}
                            </span>
                            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '3px' }}>
                              Booking ID: #{booking.id}
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '15px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: '#95a5a6',
                            color: '#fff'
                          }}>
                            Completed
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UserProfile;