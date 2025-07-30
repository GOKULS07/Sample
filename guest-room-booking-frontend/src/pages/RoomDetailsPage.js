import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './RoomDetailsPage.css';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axios.get(`https://room-booker.onrender.com/api/rooms/${id}`);
        setRoom(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room details. Room might not exist.');
        setLoading(false);
        if (err.response && err.response.status === 401) {
          navigate('/login', { state: { from: `/rooms/${id}` } });
        }
      }
    };
    fetchRoom();
  }, [id, navigate]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rooms/${id}` } });
    } else if (isCustomer) {
     
      navigate(`/customer/book/${room._id}`);
    } else {
      alert("House Owners cannot book rooms for themselves through this portal.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="page-container page-title">Loading Room Details...</div>;
  }

  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  if (!room) {
    return <div className="page-container page-title">Room not found.</div>;
  }

  return (
    <div className="page-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Room Details: {room.name}</h2>
      <div className="room-details-top-section"> 
        <div className="room-details-image-container">
          <img src={room.photos[0] || 'https://via.placeholder.com/800x400?text=No+Image'} alt={room.name} className="room-details-image" />
        </div>
        <div className="room-details-info">
          <h3>About this Room</h3>
          <p className="room-description">{room.description || 'No description provided.'}</p>
          <div className="detail-item">
            <strong>Location:</strong> N/A
          </div>
          <div className="detail-item">
            <strong>Beds:</strong> {room.numberOfBeds}
          </div>
          <div className="detail-item">
            <strong>Amenities:</strong> {room.amenities && room.amenities.length > 0 ? room.amenities.join(', ') : 'None'}
          </div>
          <div className="detail-item">
            <strong>Daily Rent:</strong> ₹{room.dailyRentAmount}
          </div>
          <div className="detail-item">
            <strong>Min/Max Stay:</strong> {room.minBookingDays}-{room.maxBookingDays} days
          </div>

          
          <button onClick={handleBookNow} className="primary-button room-details-book-button">
            Book Now
          </button>
        </div>
      </div>
     

      <div className="back-link-container">
        <Link to="/rooms" className="back-link">← Back to Room Listings</Link>
      </div>
    </div>
  );
}

export default RoomDetailsPage;
