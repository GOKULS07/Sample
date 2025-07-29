import React, { useState, useEffect } from 'react';
import './BookingHistoryPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function BookingHistoryPage() {
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
      const { data } = await axios.get('http://localhost:5000/api/bookings/customer/me');
      setBookings(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
      setError(err.response?.data?.message || 'Failed to load your booking history.');
      setLoading(false);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated, user]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        const { data } = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`);
        setMessage(data.message || 'Booking cancelled successfully!');
        fetchBookings(); 
      } catch (err) {
        console.error('Error cancelling booking:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to cancel booking.');
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="page-container page-title">Loading Booking History...</div>;
  }

  if (error && !message) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container booking-history-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">My Booking History</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {bookings.length === 0 ? (
        <p className="no-bookings-message">You have no past or upcoming bookings.</p>
      ) : (
        <div className="booking-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-item-card">
              <div className="booking-info">
                <h3>{booking.room?.name || 'N/A'}</h3>
                <p>Check-in: <strong>{new Date(booking.checkInDate).toLocaleDateString()}</strong> | Check-out: <strong>{new Date(booking.checkOutDate).toLocaleDateString()}</strong></p>
                <p>Total Price: <strong>₹{booking.totalPrice}</strong></p>
              </div>
              <div className="booking-status-actions">
                <span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button onClick={() => handleCancelBooking(booking._id)} className="cancel-button">Cancel Booking</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingHistoryPage;