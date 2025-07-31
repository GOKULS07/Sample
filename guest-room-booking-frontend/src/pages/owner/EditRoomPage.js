import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './AddRoomPage.css'; // Using the same styles as the Add Room page
import { useParams, useNavigate } from 'react-router-dom'; // Tools for grabbing URL params and navigating
import axios from 'axios'; // For talking to the backend

// This is the Edit Room Page component.
// It allows a house owner to update details of an existing room listing.
function EditRoomPage() {
  const { id } = useParams(); // Grabs the room's ID from the URL (e.g., /edit-room/ROOM_ID)
  const navigate = useNavigate(); // Helps us jump to other pages

  // State to hold all the form data for the room being edited
  const [formData, setFormData] = useState({
    name: '',
    floorSize: '',
    numberOfBeds: '',
    amenities: '',
    dailyRentAmount: '',
    minBookingDays: '',
    maxBookingDays: '',
    description: '',
    isAvailable: true, // Whether the room is currently available for booking
  });

  // States for handling images
  const [currentPhotos, setCurrentPhotos] = useState([]); // Stores URLs of photos already associated with the room
  const [selectedFile, setSelectedFile] = useState(null); // Stores the new image file (if one is selected)

  // States to manage the page's status and user feedback
  const [loading, setLoading] = useState(true); // True when initially fetching room data
  const [error, setError] = useState(null); // Any problems? They go here.
  const [submitting, setSubmitting] = useState(false); // True when busy saving changes

  // When the page loads (or the room ID changes), let's fetch the room's current data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const { data } = await axios.get(`https://room-booker.onrender.com/api/rooms/${id}`);
        const room = data.data;
        setFormData({
          name: room.name || '',
          floorSize: room.floorSize || '',
          numberOfBeds: room.numberOfBeds || '',
          amenities: room.amenities.join(', ') || '', // Convert amenities array to comma-separated string
          dailyRentAmount: room.dailyRentAmount || '',
          minBookingDays: room.minBookingDays || '',
          maxBookingDays: room.maxBookingDays || '',
          description: room.description || '',
          isAvailable: room.isAvailable,
        });
        setCurrentPhotos(room.photos || []); // Store current photo URLs to display
        setLoading(false); // Done loading initial data!

      } catch (err) {
        console.error('Problem fetching room for edit:', err);
        setError('Couldn\'t load room data for editing.'); // Show a friendly error message
        setLoading(false);
        // Note: Missing authentication checks here as per previous refactoring. ProtectedRoute handles direct access.
      }
    };
    fetchRoomData(); // Go get the room data when the component first shows up
  }, [id]); // This effect runs only when the 'id' in the URL changes

  // What happens when any input field in the form changes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target; // Get details about the changed input
    setFormData({
      ...formData, // Keep all the other form data
      [id]: type === 'checkbox' ? checked : value, // Update just the field that changed
    });
  };

  // What happens when a new image file is selected
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Grabs the first selected file
  };

  // What happens when the "Save Changes" form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the browser's default form submission
    setSubmitting(true); // Shows that we're busy saving changes
    setError(null); // Clear any old errors

    // Prepare our form data to send to the backend.
    // We use FormData because we're sending a file (image).
    const roomData = new FormData(); 

    // Append each form field one by one to FormData, with proper type conversions
    roomData.append('name', formData.name);
    roomData.append('floorSize', Number(formData.floorSize));
    roomData.append('numberOfBeds', Number(formData.numberOfBeds));
    roomData.append('dailyRentAmount', Number(formData.dailyRentAmount));
    roomData.append('minBookingDays', Number(formData.minBookingDays));
    roomData.append('maxBookingDays', Number(formData.maxBookingDays));
    // Convert amenities back to a comma-separated string for backend processing
    roomData.append('amenities', formData.amenities.split(',').map(item => item.trim()).filter(Boolean).join(','));
    roomData.append('description', formData.description);
    roomData.append('isAvailable', formData.isAvailable); // Appends as 'true' or 'false' string

    // Handle the image file for submission
    if (selectedFile) {
      // If a new file is selected, append it (backend will process this as the new image)
      roomData.append('roomImage', selectedFile); // 'roomImage' is the field name Multer expects
    } else {
      // If no new file is selected, but there are existing photos, send them back as a JSON string.
      // This tells the backend to keep the old photos.
      roomData.append('photos', JSON.stringify(currentPhotos));
    }

    try {
      // Set headers for file upload (Axios handles the complex part)
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for file uploads
          // Authorization header is automatically handled by AuthContext
        },
      };
      await axios.put(`https://room-booker.onrender.com/api/rooms/${id}`, roomData, config);
      alert('Room updated successfully!');
      navigate('/owner/manage-rooms');
    } catch (err) {
      console.error('Problem updating room:', err);
      // Try to get a specific error message from the backend, especially for validation problems
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).map(val => val.message);
        setError(`Validation failed: ${validationErrors.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Couldn\'t update room.');
      }
    } finally {
      setSubmitting(false); // Turn off busy state
    }
  };

  // Simple function to go back to the previous page
  const handleBack = () => {
    navigate(-1);
  };

  // Show a loading screen while we fetch initial data
  if (loading) {
    return <div className="page-container page-title">Loading Room Data...</div>;
  }

  // If there was an error loading data, show it
  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  // If no room was found or loaded, perhaps show a message (though error handles most)
  return (
    <div className="page-container add-room-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Edit Room: {formData.name}</h2> {/* Page title showing room name */}
      <form className="room-form" onSubmit={handleSubmit}> {/* Our edit room form */}
        {error && <p className="error-message">{error}</p>} {/* Show general error message */}
        
        {/* Room Name input */}
        <div className="form-group">
          <label htmlFor="name">Room Name:</label>
          <input type="text" id="name" value={formData.name} onChange={handleChange} required disabled={submitting} />
        </div>
        {/* Floor Size input */}
        <div className="form-group">
          <label htmlFor="floorSize">Floor Size (sq ft):</label>
          <input type="number" id="floorSize" value={formData.floorSize} onChange={handleChange} required disabled={submitting} />
        </div>
        {/* Number of Beds input */}
        <div className="form-group">
          <label htmlFor="numberOfBeds">Number of Beds:</label>
          <input type="number" id="numberOfBeds" value={formData.numberOfBeds} onChange={handleChange} required disabled={submitting} />
        </div>
        {/* Amenities input */}
        <div className="form-group">
          <label htmlFor="amenities">Amenities (comma-separated):</label>
          <input type="text" id="amenities" value={formData.amenities} onChange={handleChange} placeholder="e.g., Wi-Fi, AC, Private Bath" disabled={submitting} />
        </div>
        {/* Daily Rent Amount input */}
        <div className="form-group">
          <label htmlFor="dailyRentAmount">Daily Rent (₹):</label>
          <input type="number" id="dailyRentAmount" value={formData.dailyRentAmount} onChange={handleChange} required disabled={submitting} />
        </div>
        {/* Minimum Booking Days input */}
        <div className="form-group">
          <label htmlFor="minBookingDays">Minimum Booking Days:</label>
          <input type="number" id="minBookingDays" value={formData.minBookingDays} onChange={handleChange} required disabled={submitting} />
        </div>
        {/* Maximum Booking Days input */}
        <div className="form-group">
          <label htmlFor="maxBookingDays">Maximum Booking Days:</label>
          <input type="number" id="maxBookingDays" value={formData.maxBookingDays} onChange={handleChange} required disabled={submitting} />
        </div>

        {/* Section for managing current and new photos */}
        <div className="form-group">
          <label>Current Photos:</label>
          <div className="current-photos-preview">
            {currentPhotos.length > 0 ? (
              currentPhotos.map((photoUrl, index) => (
                <img key={index} src={photoUrl} alt={`Room ${index + 1}`} className="photo-preview-thumbnail" />
              ))
            ) : (
              <p>No current photos.</p>
            )}
          </div>
          <label htmlFor="roomImage" className="file-upload-label">Upload New Photo:</label>
          <input type="file" id="roomImage" accept="image/*" onChange={handleFileChange} disabled={submitting} />
          <p className="form-hint">Select a new image file to replace/add. Max 1 file for now.</p>
        </div>

        {/* Description textarea */}
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={formData.description} onChange={handleChange} rows="4" disabled={submitting}></textarea>
        </div>
        {/* Is Available checkbox */}
        <div className="form-group checkbox-group">
          <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={handleChange} disabled={submitting} />
          <label htmlFor="isAvailable" className="checkbox-label">Available for Booking</label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving Changes...' : 'Save Changes'} {/* Button text changes when busy */}
        </button>
      </form>
    </div>
  );
}

export default EditRoomPage;
