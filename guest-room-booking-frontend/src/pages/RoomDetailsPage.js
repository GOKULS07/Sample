import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import { useParams, Link, useNavigate } from 'react-router-dom'; // Tools for routes, linking, and navigation
import './RoomDetailsPage.css'; // Our specific styles for this page
import { useAuth } from '../contexts/AuthContext'; // Our custom hook to check login status
import axios from 'axios'; // For talking to the backend

// This is the Room Details Page component.
// It fetches and displays all the info about a single room.
function RoomDetailsPage() {
  const { id } = useParams(); // Grabs the room ID from the URL
  const navigate = useNavigate(); // Helps us jump to other pages
  const { isAuthenticated, isCustomer } = useAuth(); // Checks if the user is logged in and if they're a customer

  // States to manage our data and the page's status
  const [room, setRoom] = useState(null); // Holds the details of the room we're showing
  const [loading, setLoading] = useState(true); // True when we're waiting for room data
  const [error, setError] = useState(null); // Any problems getting room data? They go here.

  // When the page loads or the room ID changes, let's fetch the room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axios.get(`https://room-booker.onrender.com/api/rooms/${id}`);
        setRoom(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Problem fetching room:', err);
        setError('Couldn\'t load room details. Maybe this room doesn\'t exist?'); // Friendly error message
        setLoading(false);
        // If the backend says we're unauthorized, send them to login
        if (err.response && err.response.status === 401) {
          navigate('/login', { state: { from: `/rooms/${id}` } });
        }
      }
    };
    fetchRoom(); // Go get the room data!
  }, [id, navigate]); // Runs when the room ID or navigate function changes

  // What happens when the "Book Now" button is clicked
  const handleBookNow = () => {
    // If not logged in, send them to the login page
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rooms/${id}` } });
    } else if (isCustomer) {
      // If it's a customer, send them directly to the booking page for this room
      // This hits: /customer/book/:id
      navigate(`/customer/book/${room._id}`);
    } else {
      // If an owner tries to book (which isn't allowed here), give an alert
      alert("Heads up! House Owners can't book rooms for themselves using this portal.");
    }
  };

  // Simple function to go back to the last page visited
  const handleBack = () => {
    navigate(-1);
  };

  // Show a loading message while we're fetching data
  if (loading) {
    return <div className="page-container page-title">Loading Room Details...</div>;
  }

  // If there was an error, show it
  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  // If no room was found (e.g., ID was bad), show this message
  if (!room) {
    return <div className="page-container page-title">Room not found.</div>;
  }

  return (
    <div className="page-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">Room Details: {room.name}</h2> {/* Room title */}
      {/* This section holds the room image and its details side-by-side */}
      <div className="room-details-top-section"> 
        <div className="room-details-image-container">
          <img src={room.photos[0] || 'https://via.placeholder.com/800x400?text=No+Image'} alt={room.name} className="room-details-image" /> {/* Room image */}
        </div>
        <div className="room-details-info"> {/* Section for room description and details */}
          <h3>About this Room</h3>
          <p className="room-description">{room.description || 'No description provided.'}</p> {/* Room description */}
          <div className="detail-item">
            <strong>Location:</strong> N/A {/* Placeholder for location as it's not in schema */}
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
            Book Now {/* Button to proceed to booking */}
          </button>
        </div>
      </div>
      
      {/* Link to go back to the main room listings page */}
      <div className="back-link-container">
        <Link to="/rooms" className="back-link">← Back to Room Listings</Link>
      </div>
    </div>
  );
}

export default RoomDetailsPage;
