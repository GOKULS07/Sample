import React, { useState, useEffect } from 'react';
import './RoomListPage.css';
import { Link } from 'react-router-dom';
import axios from 'axios'; 

function RoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/rooms');
        setRooms(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again later.');
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return <div className="page-container page-title">Loading Rooms...</div>;
  }

  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Browse Available Rooms</h2>
      {rooms.length === 0 ? (
        <p className="no-rooms-message">No rooms available for listing yet.</p>
      ) : (
        <div className="room-list-grid">
          {rooms.map(room => (
            <div key={room._id} className="room-card">
              <img src={room.photos[0] || 'https://via.placeholder.com/300x200?text=No+Image'} alt={room.name} className="room-image" />
              <div className="room-info">
                <h3>{room.name}</h3>
                <p>Beds: {room.numberOfBeds} | Size: {room.floorSize} sq ft</p>
                <p className="room-price">₹{room.dailyRentAmount} / night</p>
                <Link to={`/rooms/${room._id}`} className="view-details-button">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoomListPage;