import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './OwnerDashboard.css'; // Our specific styles for this dashboard
import { Link, useNavigate } from 'react-router-dom'; // Tools for linking and navigating
import axios from 'axios'; // For talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook to get login status and user info

// This is the Owner Dashboard component.
// It shows a summary for house owners, like their total rooms and upcoming bookings.
function OwnerDashboard() {
  const navigate = useNavigate(); // Lets us jump to other pages
  const { user, isAuthenticated } = useAuth(); // Checks if the user is logged in and gets their info

  // States to hold our dashboard data and manage loading/errors
  const [roomsCount, setRoomsCount] = useState(0); // How many rooms this owner has listed
  const [upcomingBookingsCount, setUpcomingBookingsCount] = useState(0); // How many future bookings they have
  const [recentBookings, setRecentBookings] = useState([]); // A list of their latest bookings for activity feed
  const [loading, setLoading] = useState(true); // True when we're waiting for data
  const [error, setError] = useState(null); // Any problems? They go here.

  // When the page loads or user/auth status changes, let's fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      // If no one's logged in (or we don't have user info), stop loading and don't fetch
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        
        const roomsResponse = await axios.get('https://room-booker.onrender.com/api/rooms/owner-rooms/me');
        setRoomsCount(roomsResponse.data.count);

        
        const bookingsResponse = await axios.get('https://room-booker.onrender.com/api/bookings/owner/me');
        const allBookings = bookingsResponse.data.data;

        // Let's figure out how many upcoming bookings there are
        const now = new Date(); // Current date and time
        const upcoming = allBookings.filter(booking => {
          const checkIn = new Date(booking.checkInDate); // Convert check-in date string to a Date object
          // An upcoming booking is either 'pending' or 'confirmed' AND its check-in date is in the future
          return (booking.status === 'pending' || booking.status === 'confirmed') && checkIn > now;
        });
        setUpcomingBookingsCount(upcoming.length); // Update the count of upcoming bookings

        // Get the very latest bookings for the 'Recent Activity' list
        const sortedBookings = allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date (newest first)
        setRecentBookings(sortedBookings.slice(0, 3)); // Take only the top 3 most recent bookings

        setLoading(false); // Done loading all the dashboard data!

      } catch (err) {
        console.error('Problem fetching dashboard data:', err); // Log any serious errors
        setError(err.response?.data?.message || 'Failed to load dashboard data.'); // Show a friendly error message
        setLoading(false);
        // If the backend says we're unauthorized (401), send them to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchData(); // Kick off the data fetching when the component first shows up
  }, [isAuthenticated, user, navigate]); // This effect runs when these values change

  // What happens when the "Back" button is clicked
  const handleBack = () => {
    navigate(-1); // Goes back to the previous page in browser history
  };

  // Show a loading message while data is being fetched
  if (loading) {
    return <div className="page-container page-title">Loading Dashboard...</div>;
  }

  // If there was an error loading data, show it
  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container owner-dashboard-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">Owner Dashboard</h2> {/* Dashboard title */}

      {/* Grid of summary cards: Total Rooms, Upcoming Bookings, Add Room */}
      <div className="dashboard-summary-grid">
        {/* Card for Total Rooms Listed */}
        <div className="summary-card">
          <h3>Total Rooms Listed</h3>
          <p className="summary-value">{roomsCount}</p> {/* Shows dynamic room count */}
          <Link to="/owner/manage-rooms" className="summary-link">Manage Rooms</Link> {/* Link to manage rooms */}
        </div>
        {/* Card for Upcoming Bookings */}
        <div className="summary-card">
          <h3>Upcoming Bookings</h3>
          <p className="summary-value">{upcomingBookingsCount}</p> {/* Shows dynamic upcoming bookings count */}
          <Link to="/owner/bookings" className="summary-link">View Bookings</Link> {/* Link to view all bookings */}
        </div>
        {/* Card to add a new room */}
        <div className="summary-card">
          <h3>Add New Room</h3>
          <p className="summary-value add-room-icon">+</p> {/* Plus icon */}
          <Link to="/owner/add-room" className="summary-link">Add Room</Link> {/* Link to add a room */}
        </div>
      </div>

      {/* Section for recent activity, mainly recent bookings */}
      <div className="recent-activity-section">
        <h3>Recent Activity</h3>
        <ul className="activity-list">
          {recentBookings.length > 0 ? ( // If there are recent bookings, show them
            recentBookings.map(booking => (
              <li key={booking._id}>
                New booking for "{booking.room?.name || 'Unknown Room'}" from {new Date(booking.checkInDate).toLocaleDateString()} to {new Date(booking.checkOutDate).toLocaleDateString()}. Status: {booking.status}.
              </li>
            ))
          ) : ( // Otherwise, show a message
            <li>No recent booking activity.</li>
          )}
          {/* These are dummy activities for now, to be replaced by real data later if expanded */}
          <li>"Spacious Family Home" was updated. (Dummy)</li>
          <li>Booking for "Downtown Studio" completed on July 20. (Dummy)</li>
        </ul>
      </div>
    </div>
  );
}

export default OwnerDashboard;
