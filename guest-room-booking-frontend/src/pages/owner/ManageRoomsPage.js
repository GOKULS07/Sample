import React, { useState, useEffect } from 'react';
import './ManageRoomsPage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { useAuth } from '../../contexts/AuthContext';

function ManageRoomsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); 
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnerRooms = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return; 
      }
      try {
        const { data } = await axios.get('https://room-booker.onrender.com/api/rooms/owner-rooms/me');
        setRooms(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching owner rooms:', err);
        setError(err.response?.data?.message || 'Failed to load your rooms.');
        setLoading(false);
      }
    };
    fetchOwnerRooms();
  }, [isAuthenticated, user]); 

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`https://room-booker.onrender.com/api/rooms/${roomId}`);
        alert('Room deleted successfully!');
        setRooms(rooms.filter(room => room._id !== roomId)); 
      } catch (err) {
        console.error('Error deleting room:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to delete room.');
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="page-container page-title">Loading Rooms...</div>;
  }

  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container manage-rooms-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Manage Your Rooms</h2>
      <Link to="/owner/add-room" className="primary-button add-new-room-button">Add New Room</Link>

      {rooms.length === 0 ? (
        <p className="no-rooms-message">You haven't listed any rooms yet. Click "Add New Room" to get started!</p>
      ) : (
        <div className="room-management-list">
          {rooms.map(room => (
            <div key={room._id} className="manage-room-card">
              <img src={room.photos[0] || 'https://via.placeholder.com/100x80?text=No+Image'} alt={room.name} className="manage-room-image" />
              <div className="manage-room-info">
                <h3>{room.name}</h3>
                <p>Beds: {room.numberOfBeds} | Price: ₹{room.dailyRentAmount} / night</p>
                <span className={`room-status ${room.isAvailable ? 'active' : 'inactive'}`}>
                  {room.isAvailable ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="manage-room-actions">
                <Link to={`/owner/edit-room/${room._id}`} className="action-button edit-button">Edit</Link>
                <button onClick={() => handleDelete(room._id)} className="action-button delete-button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageRoomsPage;
