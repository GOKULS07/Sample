import React, { useState, useEffect } from 'react';
import './CustomerDashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerBookingsCount = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get('http://localhost:5000/api/bookings/customer/me');
        setBookingsCount(data.count);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customer bookings count:', err);
        setError('Failed to load booking count.');
        setLoading(false);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchCustomerBookingsCount();
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
    <div className="page-container customer-dashboard-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Customer Dashboard</h2>

      <div className="dashboard-summary-grid">
        <div className="summary-card">
          <h3>My Bookings</h3>
          <p className="summary-value">{bookingsCount}</p>
          <Link to="/customer/bookings" className="summary-link">View Details</Link>
        </div>
        <div className="summary-card">
          <h3>Find New Rooms</h3>
          <p className="summary-value search-icon">🔍</p>
          <Link to="/rooms" className="summary-link">Browse Rooms</Link>
        </div>
        <div className="summary-card">
          <h3>Manage Profile</h3>
          <p className="summary-value profile-icon">👤</p>
          <Link to="/customer/profile" className="summary-link">Edit Profile</Link>
        </div>
      </div>

      <div className="recent-activity-section">
        <h3>Recent Bookings</h3>
        <ul className="activity-list">
          <li>Booked "Cozy City Apartment" for July 28 - Aug 2.</li>
          <li>Checked out from "Spacious Family Home" on July 27.</li>
          <li>Upcoming booking for "Mountain View Cabin" on Aug 10.</li>
        </ul>
      </div>
    </div>
  );
}

export default CustomerDashboard;