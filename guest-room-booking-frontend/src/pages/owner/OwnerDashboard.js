import React, { useState, useEffect } from 'react';
import './OwnerDashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [roomsCount, setRoomsCount] = useState(0); // For total rooms listed
  const [upcomingBookingsCount, setUpcomingBookingsCount] = useState(0); // For dynamic upcoming bookings
  const [recentBookings, setRecentBookings] = useState([]); // For recent activity list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        // Fetch Owner's Rooms Count
        const roomsResponse = await axios.get('http://localhost:5000/api/rooms/owner-rooms/me');
        setRoomsCount(roomsResponse.data.count);

        // Fetch Owner's Bookings
        const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/owner/me');
        const allBookings = bookingsResponse.data.data;

        // Filter for upcoming bookings
        const now = new Date();
        const upcoming = allBookings.filter(booking => {
          const checkIn = new Date(booking.checkInDate);
          return (booking.status === 'pending' || booking.status === 'confirmed') && checkIn > now;
        });
        setUpcomingBookingsCount(upcoming.length);

        // Get most recent bookings for activity list (e.g., top 3)
        const sortedBookings = allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentBookings(sortedBookings.slice(0, 3)); // Take top 3 most recent

        setLoading(false);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
        setLoading(false);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="page-container page-title">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container owner-dashboard-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Owner Dashboard</h2>

      <div className="dashboard-summary-grid">
        <div className="summary-card">
          <h3>Total Rooms Listed</h3>
          <p className="summary-value">{roomsCount}</p>
          <Link to="/owner/manage-rooms" className="summary-link">Manage Rooms</Link>
        </div>
        <div className="summary-card">
          <h3>Upcoming Bookings</h3>
          <p className="summary-value">{upcomingBookingsCount}</p>
          <Link to="/owner/bookings" className="summary-link">View Bookings</Link>
        </div>
        <div className="summary-card">
          <h3>Add New Room</h3>
          <p className="summary-value add-room-icon">+</p>
          <Link to="/owner/add-room" className="summary-link">Add Room</Link>
        </div>
      </div>

      <div className="recent-activity-section">
        <h3>Recent Activity</h3>
        <ul className="activity-list">
          {recentBookings.length > 0 ? (
            recentBookings.map(booking => (
              <li key={booking._id}>
                New booking for "{booking.room?.name || 'Unknown Room'}" from {new Date(booking.checkInDate).toLocaleDateString()} to {new Date(booking.checkOutDate).toLocaleDateString()}. Status: {booking.status}.
              </li>
            ))
          ) : (
            <li>No recent booking activity.</li>
          )}
          {/* Keeping a dummy for other activities if needed in the future */}
          <li>"Spacious Family Home" was updated. (Dummy)</li>
          <li>Booking for "Downtown Studio" completed on July 20. (Dummy)</li>
        </ul>
      </div>
    </div>
  );
}

export default OwnerDashboard;