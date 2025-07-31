import React, { useState } from 'react'; // React hooks for managing data on the page
import './AddRoomPage.css'; // Our specific styles for this page
import { useNavigate } from 'react-router-dom'; // For navigating after adding a room
import axios from 'axios'; // Our tool for talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook for authentication (to get user context, though not directly used in form submit logic)

// This is the Add Room Page component.
// House owners use this to create new room listings.
function AddRoomPage() {
  const navigate = useNavigate(); // Lets us jump to other pages after saving
  const { user } = useAuth(); // Keeping this here; useful if we need user ID for validation or tracking

  // State to hold all the data from our form inputs
  const [formData, setFormData] = useState({
    name: '',
    floorSize: '',
    numberOfBeds: '',
    amenities: '', // Stored as a comma-separated string for input
    dailyRentAmount: '',
    minBookingDays: '',
    maxBookingDays: '',
    description: '',
    isAvailable: true, // Room is available by default
  });

  // State to hold the image file chosen by the user
  const [selectedFile, setSelectedFile] = useState(null);

  // States for page status and user feedback
  const [loading, setLoading] = useState(false); // True when we're busy submitting the form
  const [error, setError] = useState(null); // Any problems? They go here.

  // What happens when any input field changes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target; // Get input details
    // Update the formData state, handling checkboxes differently
    setFormData({ ...formData, [id]: type === 'checkbox' ? checked : value });
  };

  // What happens when an image file is selected
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Grabs the first selected file
  };

  // What happens when the Add Room form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the browser's default form submission
    setLoading(true); // Shows that we're busy submitting
    setError(null); // Clear any old errors

    // Basic client-side validation before sending data
    if (!selectedFile) {
      setError('Oops! Please select an image file for the room.');
      setLoading(false);
      return;
    }
    if (
      !formData.name || !formData.floorSize || !formData.numberOfBeds ||
      !formData.dailyRentAmount || !formData.minBookingDays || !formData.maxBookingDays
    ) {
      setError('Hang on! Please fill in all the required fields.');
      setLoading(false);
      return;
    }

    // Prepare our data to send to the backend. We use FormData because we're sending a file.
    const roomData = new FormData();

    // Append each form field to FormData, converting types as needed
    roomData.append('name', formData.name);
    roomData.append('floorSize', Number(formData.floorSize)); // Convert to a number
    roomData.append('numberOfBeds', Number(formData.numberOfBeds)); // Convert to a number
    roomData.append('dailyRentAmount', Number(formData.dailyRentAmount)); // Convert to a number
    roomData.append('minBookingDays', Number(formData.minBookingDays)); // Convert to a number
    roomData.append('maxBookingDays', Number(formData.maxBookingDays)); // Convert to a number
    
    // Process amenities: splits the comma-separated string, cleans up spaces, and joins back for backend
    roomData.append('amenities', formData.amenities.split(',').map(item => item.trim()).filter(Boolean).join(','));

    roomData.append('description', formData.description);
    roomData.append('isAvailable', formData.isAvailable); // Boolean value (FormData sends 'true'/'false' string)

    // Add the selected image file to our form data
    roomData.append('roomImage', selectedFile); // 'roomImage' is the name our backend (Multer) expects

    try {
      // Configure our request headers, especially 'multipart/form-data' for file uploads
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for file uploads
          // Axios automatically adds Authorization header if user is logged in (from AuthContext)
        },
      };
      await axios.post('https://room-booker.onrender.com/api/rooms', roomData, config);
      alert('Room added successfully!');
      navigate('/owner/manage-rooms');
    } catch (err) {
      console.error('Problem adding room:', err.response?.data?.message || err.message);
      // Try to get specific validation errors from the backend response
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).map(val => val.message);
        setError(`Validation failed: ${validationErrors.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Couldn\'t add room. Please try again.');
      }
    } finally {
      setLoading(false); // Stop loading animation regardless of success or failure
    }
  };

  // Function to go back to the previous page
  const handleBack = () => {
    navigate(-1);
  };

  // Show a loading message while the form is submitting (or initial state)
  if (loading) { // This `loading` state is actually for submission, not initial fetch.
                 // A separate `initialLoading` state might be clearer for initial fetch.
    return <div className="page-container page-title">Adding Room...</div>;
  }

  // If there's a major error, display it
  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container add-room-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">Add New Room</h2> {/* Page title */}
      <form className="room-form" onSubmit={handleSubmit}> {/* Our form for adding a room */}
        {error && <p className="error-message">{error}</p>} {/* Displays any general errors */}
        
        {/* Input fields for room details */}
        <div className="form-group">
          <label htmlFor="name">Room Name:</label>
          <input type="text" id="name" value={formData.name} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="floorSize">Floor Size (sq ft):</label>
          <input type="number" id="floorSize" value={formData.floorSize} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="numberOfBeds">Number of Beds:</label>
          <input type="number" id="numberOfBeds" value={formData.numberOfBeds} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="amenities">Amenities (comma-separated):</label>
          <input type="text" id="amenities" value={formData.amenities} onChange={handleChange} placeholder="e.g., Wi-Fi, AC, Private Bath" disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="dailyRentAmount">Daily Rent (₹):</label>
          <input type="number" id="dailyRentAmount" value={formData.dailyRentAmount} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="minBookingDays">Minimum Booking Days:</label>
          <input type="number" id="minBookingDays" value={formData.minBookingDays} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="maxBookingDays">Maximum Booking Days:</label>
          <input type="number" id="maxBookingDays" value={formData.maxBookingDays} onChange={handleChange} required disabled={loading} />
        </div>

        {/* File upload input for room photo */}
        <div className="form-group">
          <label htmlFor="roomImage" className="file-upload-label">Upload Room Photo:</label>
          <input type="file" id="roomImage" accept="image/*" onChange={handleFileChange} required disabled={loading} />
          <p className="form-hint">Select a single image file for the room.</p>
        </div>

        {/* Textarea for room description */}
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={formData.description} onChange={handleChange} rows="4" disabled={loading}></textarea>
        </div>
        {/* Checkbox for room availability */}
        <div className="form-group checkbox-group">
          <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={handleChange} disabled={loading} />
          <label htmlFor="isAvailable" className="checkbox-label">Available for Booking</label>
        </div>
        {/* Submit button */}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Adding Room...' : 'Add Room'} {/* Button text changes when submitting */}
        </button>
      </form>
    </div>
  );
}

<<<<<<< HEAD
export default AddRoomPage; // Makes this component available for use elsewhere
=======
export default AddRoomPage;
>>>>>>> 9ff74573d08bcf5d1c1b32543741782078399b66
