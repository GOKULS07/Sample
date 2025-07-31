import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './BookingManagementPage.css'; // Our specific styles for this page
import { useNavigate } from 'react-router-dom'; // For navigating between pages
import axios from 'axios'; // Our tool for talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook to get login status and user info

// This is the Booking Management Page for House Owners.
// Owners can see all bookings made for their rooms and update their status.
function BookingManagementPage() {
  const navigate = useNavigate(); // Lets us jump to other pages
  const { user, isAuthenticated } = useAuth(); // Checks if the user is logged in and gets their info

  // States to hold our bookings data and manage loading/errors
  const [bookings, setBookings] = useState([]); // Holds all booking data for owner's rooms
  const [loading, setLoading] = useState(true); // True when we're waiting for booking data
  const [error, setError] = useState(null); // Any problems? They go here.
  const [message, setMessage] = useState(null); // Success messages live here.

  // Function to fetch all bookings for the logged-in owner's rooms
  const fetchBookings = async () => {
    // If no one's logged in (or we don't have user info), stop loading and don't fetch
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get('https://room-booker.onrender.com/api/bookings/owner/me');
      setBookings(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Problem fetching owner bookings:', err); // Log any serious errors
      setError(err.response?.data?.message || 'Failed to load bookings.'); // Show a friendly error message
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

  // What happens when an owner updates a booking's status (Confirm, Mark Complete, Cancel)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    // Ask for confirmation before changing status
    if (window.confirm(`Are you sure you want to change this booking status to "${newStatus}"?`)) {
      try {
        const { data } = await axios.put(`https://room-booker.onrender.com/api/bookings/${bookingId}/status`, { status: newStatus });
        setMessage(data.message || 'Booking status updated!');
        fetchBookings(); 
      } catch (err) {
        console.error('Problem updating status:', err); // Log any errors
        setError(err.response?.data?.message || 'Failed to update status.'); // Show a friendly error message
      }
    }
  };

  // What happens when the "Back" button is clicked
  const handleBack = () => {
    navigate(-1); // Goes back to the previous page in browser history
  };

  // Show a loading message while data is being fetched
  if (loading) {
    return <div className="page-container page-title">Loading Bookings...</div>;
  }

  // If there was an error loading data, show it
  if (error && !message) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container booking-management-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">Booking Management</h2> {/* Page title */}
      {error && <p className="error-message">{error}</p>} {/* Shows general error message */}
      {message && <p className="success-message">{message}</p>} {/* Shows success message */}

      {bookings.length === 0 ? ( // If the owner has no bookings, show a message
        <p className="no-bookings-message">No bookings made for your rooms yet.</p>
      ) : (
        // If there are bookings, display them in a table
        <table className="bookings-table">
          <thead> {/* Table header */}
            <tr>
              <th>Room Name</th>
              <th>Customer Email</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody> {/* Table body, loops through each booking */}
            {bookings.map(booking => (
              <tr key={booking._id} data-label=""> {/* Each row is a booking */}
                <td data-label="Room Name">{booking.room?.name || 'N/A'}</td> {/* Room name (with fallback) */}
                <td data-label="Customer Email">{booking.customer?.email || 'N/A'}</td> {/* Customer email (with fallback) */}
                <td data-label="Check-in">{new Date(booking.checkInDate).toLocaleDateString()}</td> {/* Formatted check-in date */}
                <td data-label="Check-out">{new Date(booking.checkOutDate).toLocaleDateString()}</td> {/* Formatted check-out date */}
                <td data-label="Status"><span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span></td> {/* Booking status badge */}
                <td data-label="Actions"> {/* Action buttons based on status */}
                  {booking.status === 'pending' && ( // If pending, show 'Confirm' button
                    <button onClick={() => handleUpdateStatus(booking._id, 'confirmed')} className="action-button confirm-button">Confirm</button>
                  )}
                  {booking.status === 'confirmed' && ( // If confirmed, show 'Mark Complete' button
                    <button onClick={() => handleUpdateStatus(booking._id, 'completed')} className="action-button complete-button">Mark Complete</button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && ( // If pending or confirmed, show 'Cancel' button
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

<<<<<<< HEAD
export default BookingManagementPage; // Make this component available
=======
export default BookingManagementPage;
>>>>>>> 9ff74573d08bcf5d1c1b32543741782078399b66
