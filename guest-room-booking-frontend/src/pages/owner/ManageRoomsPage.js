import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './ManageRoomsPage.css'; // Our specific styles for this page
import { Link, useNavigate } from 'react-router-dom'; // Tools for linking and navigation
import axios from 'axios'; // Our tool for talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook to get login status and user info

// This is the Manage Rooms Page component.
// It allows a house owner to see all their listed rooms, and to edit or delete them.
function ManageRoomsPage() {
  const navigate = useNavigate(); // Lets us jump to other pages
  const { user, isAuthenticated } = useAuth(); // Checks if the user is logged in and gets their info

  // States to hold our rooms data and manage loading/errors
  const [rooms, setRooms] = useState([]); // Holds all the rooms listed by this owner
  const [loading, setLoading] = useState(true); // True when we're waiting for room data
  const [error, setError] = useState(null); // Any problems? They go here.

  // When the page loads or user/auth status changes, let's fetch the owner's rooms
  useEffect(() => {
    const fetchOwnerRooms = async () => {
      // If no one's logged in (or we don't have user info), stop loading and don't fetch
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get('https://room-booker.onrender.com/api/rooms/owner-rooms/me');
        setRooms(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Problem fetching owner rooms:', err); // Log any serious errors
        setError(err.response?.data?.message || 'Couldn\'t load your rooms.'); // Show a friendly error message
        setLoading(false);
      }
    };
    fetchOwnerRooms(); // Kick off the data fetching when the component first shows up
  }, [isAuthenticated, user]); // This effect runs when user or auth status changes

  // What happens when the "Delete" button for a room is clicked
  const handleDelete = async (roomId) => {
    // Ask for confirmation before deleting
    if (window.confirm('Are you sure you want to delete this room? This cannot be undone!')) {
      try {
        await axios.delete(`https://room-booker.onrender.com/api/rooms/${roomId}`);
        alert('Room deleted successfully!');
        setRooms(rooms.filter(room => room._id !== roomId)); 
      } catch (err) {
        console.error('Problem deleting room:', err); // Log any errors
        setError(err.response?.data?.message || 'Couldn\'t delete room.'); // Show a friendly error message
      }
    }
  };

  // What happens when the "Back" button is clicked
  const handleBack = () => {
    navigate(-1); // Goes back to the previous page in browser history
  };

  // Show a loading message while data is being fetched
  if (loading) {
    return <div className="page-container page-title">Loading Rooms...</div>;
  }

  // If there was an error loading data, show it
  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container manage-rooms-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">Manage Your Rooms</h2> {/* Page title */}
      {/* Button to add a brand new room */}
      <Link to="/owner/add-room" className="primary-button add-new-room-button">Add New Room</Link>

      {rooms.length === 0 ? ( // If the owner has no rooms listed, show a message
        <p className="no-rooms-message">You haven't listed any rooms yet. Click "Add New Room" to get started!</p>
      ) : (
        // If there are rooms, display them in a list
        <div className="room-management-list">
          {rooms.map(room => ( // Loop through each room and create a card for it
            <div key={room._id} className="manage-room-card"> {/* Each room gets its own card */}
              {/* Room image, using the first photo or a placeholder */}
              <img src={room.photos[0] || 'https://via.placeholder.com/100x80?text=No+Image'} alt={room.name} className="manage-room-image" />
              <div className="manage-room-info"> {/* Room details */}
                <h3>{room.name}</h3> {/* Room's name */}
                <p>Beds: {room.numberOfBeds} | Price: ₹{room.dailyRentAmount} / night</p>
                {/* Shows if the room is active or inactive, with different colors */}
                <span className={`room-status ${room.isAvailable ? 'active' : 'inactive'}`}>
                  {room.isAvailable ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="manage-room-actions"> {/* Buttons for editing and deleting */}
                <Link to={`/owner/edit-room/${room._id}`} className="action-button edit-button">Edit</Link> {/* Link to edit this room */}
                <button onClick={() => handleDelete(room._id)} className="action-button delete-button">Delete</button> {/* Delete button */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

<<<<<<< HEAD
export default ManageRoomsPage; // Make this component available
=======
export default ManageRoomsPage;
>>>>>>> 9ff74573d08bcf5d1c1b32543741782078399b66
