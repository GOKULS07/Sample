import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './RoomListPage.css'; // Our specific styles for this page
import { Link } from 'react-router-dom'; // For linking to individual room details
import axios from 'axios'; // Our tool for talking to the backend

// This is the Room List Page component.
// It shows all the available rooms that owners have listed.
function RoomListPage() {
  // States to manage the list of rooms and the page's status
  const [rooms, setRooms] = useState([]); // Holds all the room data we get from the server
  const [loading, setLoading] = useState(true); // True when we're waiting for room data
  const [error, setError] = useState(null); // Any problems getting rooms? They go here.

  // When the page loads, let's fetch all the rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get('https://room-booker.onrender.com/api/rooms');
        setRooms(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Problem fetching rooms:', err); // Log any errors
        setError('Couldn\'t load rooms. Please try again later.'); // Show a user-friendly error
        setLoading(false);
      }
    };
    fetchRooms(); // Go get the rooms when the component first shows up
  }, []); // The empty array means this only runs once when the component mounts

  // Show a loading message while we're fetching data
  if (loading) {
    return <div className="page-container page-title">Loading Rooms...</div>;
  }

  // If there was an error, show an error message
  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  // The visual layout of our room list page
  return (
    <div className="page-container">
      <h2 className="page-title">Browse Available Rooms</h2> {/* Page title */}
      {rooms.length === 0 ? ( // If no rooms are available, show a message
        <p className="no-rooms-message">No rooms available for listing yet.</p>
      ) : (
        // If there are rooms, display them in a grid
        <div className="room-list-grid">
          {rooms.map(room => ( // Loop through each room and create a card for it
            <div key={room._id} className="room-card"> {/* Each room gets its own card */}
              {/* Displays the first photo of the room, or a placeholder if no photo */}
              <img src={room.photos[0] || 'https://via.placeholder.com/300x200?text=No+Image'} alt={room.name} className="room-image" />
              <div className="room-info">
                <h3>{room.name}</h3> {/* Room's name */}
                <p>Beds: {room.numberOfBeds} | Size: {room.floorSize} sq ft</p> {/* Room details */}
                <p className="room-price">₹{room.dailyRentAmount} / night</p> {/* Price per night */}
                {/* Button to view more details about this specific room */}
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
