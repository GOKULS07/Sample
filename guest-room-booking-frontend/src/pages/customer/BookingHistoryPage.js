import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './BookingHistoryPage.css'; // Our specific styles for this page
import { useNavigate } from 'react-router-dom'; // For navigating between pages
import axios from 'axios'; // Our tool for talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook to get login status and user info

// This is the Booking History Page component for Customers.
// It shows a list of all bookings a customer has made (past and upcoming).
function BookingHistoryPage() {
  const navigate = useNavigate(); // Lets us jump to other pages
  const { user, isAuthenticated } = useAuth(); // Checks if the user is logged in and gets their info

  // States to hold our bookings data and manage loading/errors
  const [bookings, setBookings] = useState([]); // Holds all booking data for this customer
  const [loading, setLoading] = useState(true); // True when we're waiting for booking data
  const [error, setError] = useState(null); // Any problems? They go here.
  const [message, setMessage] = useState(null); // Success messages live here.

  // Function to fetch all bookings for the logged-in customer
  const fetchBookings = async () => {
    // If no one's logged in (or we don't have user info), stop loading and don't fetch
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get('https://room-booker.onrender.com/api/bookings/customer/me');
      setBookings(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Problem fetching customer bookings:', err); // Log any serious errors
      setError(err.response?.data?.message || 'Couldn\'t load your booking history.'); // Show a friendly error message
      setLoading(false);
      // If the backend says we're unauthorized (401), send them to login
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    }
  };

  // When the page loads or user/auth status changes, let's fetch the bookings
  useEffect(() => {
    fetchBookings(); // Go get the bookings when the component first shows up
  }, [isAuthenticated, user]); // This effect runs when user or auth status changes

  // What happens when the "Cancel Booking" button is clicked
  const handleCancelBooking = async (bookingId) => {
    // Ask for confirmation before canceling
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        const { data } = await axios.put(`https://room-booker.onrender.com/api/bookings/${bookingId}/cancel`);
        setMessage(data.message || 'Booking cancelled successfully!');
        fetchBookings(); 
      } catch (err) {
        console.error('Problem cancelling booking:', err); // Log any errors
        setError(err.response?.data?.message || 'Couldn\'t cancel booking.'); // Show a friendly error message
      }
    }
  };

  // What happens when the "Back" button is clicked
  const handleBack = () => {
    navigate(-1); // Goes back to the previous page in browser history
  };

  // Show a loading message while data is being fetched
  if (loading) {
    return <div className="page-container page-title">Loading Booking History...</div>;
  }

  // If there was an error loading data (and no success message yet), show it
  if (error && !message) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container booking-history-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">My Booking History</h2> {/* Page title */}
      {error && <p className="error-message">{error}</p>} {/* Shows general error message */}
      {message && <p className="success-message">{message}</p>} {/* Shows success message */}

      {bookings.length === 0 ? ( // If the customer has no bookings, show a message
        <p className="no-bookings-message">You have no past or upcoming bookings.</p>
      ) : (
        // If there are bookings, display them in a list
        <div className="booking-list">
          {bookings.map(booking => ( // Loop through each booking and create a card for it
            <div key={booking._id} className="booking-item-card"> {/* Each booking gets its own card */}
              <div className="booking-info"> {/* Booking details */}
                <h3>{booking.room?.name || 'N/A'}</h3> {/* Room name (with fallback) */}
                <p>Check-in: <strong>{new Date(booking.checkInDate).toLocaleDateString()}</strong> | Check-out: <strong>{new Date(booking.checkOutDate).toLocaleDateString()}</strong></p> {/* Dates */}
                <p>Total Price: <strong>₹{booking.totalPrice}</strong></p> {/* Total price */}
              </div>
              <div className="booking-status-actions"> {/* Status badge and action button */}
                <span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span> {/* Booking status badge */}
                {/* Only show "Cancel Booking" button if status is pending or confirmed */}
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
