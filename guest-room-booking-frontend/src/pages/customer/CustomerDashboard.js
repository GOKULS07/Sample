import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './CustomerDashboard.css'; // Our specific styles for this dashboard
import { Link, useNavigate } from 'react-router-dom'; // Tools for linking and navigating
import axios from 'axios'; // Our tool for talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook to get login status and user info

// This is the Customer Dashboard component.
// It shows a summary for customers, like their total bookings and recent activities.
function CustomerDashboard() {
  const navigate = useNavigate(); // Lets us jump to other pages
  const { user, isAuthenticated } = useAuth(); // Checks if the user is logged in and gets their info

  // States to hold our dashboard data and manage loading/errors
  const [bookingsCount, setBookingsCount] = useState(0); // How many bookings this customer has
  const [loading, setLoading] = useState(true); // True when we're waiting for data
  const [error, setError] = useState(null); // Any problems? They go here.

  // When the page loads or user/auth status changes, let's fetch customer booking count
  useEffect(() => {
    const fetchCustomerBookingsCount = async () => {
      // If no one's logged in (or we don't have user info), stop loading and don't fetch
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        // Ask our backend for bookings made by the current customer
        // This hits: GET /api/bookings/customer/me (protected route)
        const { data } = await axios.get('http://localhost:5000/api/bookings/customer/me');
        setBookingsCount(data.count); // Update the bookings count
        setLoading(false); // Done loading!
      } catch (err) {
        console.error('Problem fetching customer bookings count:', err); // Log any serious errors
        setError('Couldn\'t load booking count.'); // Show a friendly error message
        setLoading(false);
        // If the backend says we're unauthorized (401), send them to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchCustomerBookingsCount(); // Kick off the data fetching when the component first shows up
  }, [isAuthenticated, user, navigate]); // This effect runs when user or auth status changes

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
    <div className="page-container customer-dashboard-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">Customer Dashboard</h2> {/* Dashboard title */}

      {/* Grid of summary cards: My Bookings, Find New Rooms, Manage Profile */}
      <div className="dashboard-summary-grid">
        {/* Card for My Bookings */}
        <div className="summary-card">
          <h3>My Bookings</h3>
          <p className="summary-value">{bookingsCount}</p> {/* Shows dynamic booking count */}
          <Link to="/customer/bookings" className="summary-link">View Details</Link> {/* Link to view all bookings */}
        </div>
        {/* Card to find new rooms */}
        <div className="summary-card">
          <h3>Find New Rooms</h3>
          <p className="summary-value search-icon">🔍</p> {/* Search icon */}
          <Link to="/rooms" className="summary-link">Browse Rooms</Link> {/* Link to browse rooms */}
        </div>
        {/* Card to manage profile */}
        <div className="summary-card">
          <h3>Manage Profile</h3>
          <p className="summary-value profile-icon">👤</p> {/* Profile icon */}
          <Link to="/customer/profile" className="summary-link">Edit Profile</Link> {/* Link to edit profile */}
        </div>
      </div>

      {/* Section for recent activity, currently dummy data */}
      <div className="recent-activity-section">
        <h3>Recent Bookings</h3>
        <ul className="activity-list">
          {/* These are dummy activities for now, to be replaced by real data later */}
          <li>Booked "Cozy City Apartment" for July 28 - Aug 2.</li>
          <li>Checked out from "Spacious Family Home" on July 27.</li>
          <li>Upcoming booking for "Mountain View Cabin" on Aug 10.</li>
        </ul>
      </div>
    </div>
  );
}

export default CustomerDashboard; // Make this component available