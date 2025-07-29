import React, { useState, useEffect } from 'react';
import './BookingManagementPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function BookingManagementPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchBookings = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get('http://localhost:5000/api/bookings/owner/me');
      setBookings(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching owner bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings.');
      setLoading(false);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated, user]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (window.confirm(`Are you sure you want to change this booking status to "${newStatus}"?`)) {
      try {
        const { data } = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: newStatus });
        setMessage(data.message || 'Booking status updated!');
        fetchBookings(); 
      } catch (err) {
        console.error('Error updating status:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to update status.');
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="page-container page-title">Loading Bookings...</div>;
  }

  if (error && !message) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container booking-management-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Booking Management</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {bookings.length === 0 ? (
        <p className="no-bookings-message">No bookings made for your rooms yet.</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Customer Email</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking._id} data-label=""> 
                <td data-label="Room Name">{booking.room?.name || 'N/A'}</td>
                <td data-label="Customer Email">{booking.customer?.email || 'N/A'}</td>
                <td data-label="Check-in">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                <td data-label="Check-out">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                <td data-label="Status"><span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                <td data-label="Actions">
                  {booking.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(booking._id, 'confirmed')} className="action-button confirm-button">Confirm</button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button onClick={() => handleUpdateStatus(booking._id, 'completed')} className="action-button complete-button">Mark Complete</button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="action-button cancel-button">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BookingManagementPage;