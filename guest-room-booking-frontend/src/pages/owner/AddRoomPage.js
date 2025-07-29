import React, { useState } from 'react';
import './AddRoomPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // CORRECTED PATH

function AddRoomPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    floorSize: '',
    numberOfBeds: '',
    amenities: '',
    dailyRentAmount: '',
    minBookingDays: '',
    maxBookingDays: '',
    description: '',
    isAvailable: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({ ...formData, [id]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

   
    if (!selectedFile) {
      setError('Please select an image file for the room.');
      setLoading(false);
      return;
    }
    if (
      !formData.name || !formData.floorSize || !formData.numberOfBeds ||
      !formData.dailyRentAmount || !formData.minBookingDays || !formData.maxBookingDays
    ) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const roomData = new FormData();

    roomData.append('name', formData.name);
    roomData.append('floorSize', Number(formData.floorSize));
    roomData.append('numberOfBeds', Number(formData.numberOfBeds));
    roomData.append('dailyRentAmount', Number(formData.dailyRentAmount));
    roomData.append('minBookingDays', Number(formData.minBookingDays));
    roomData.append('maxBookingDays', Number(formData.maxBookingDays));
    
    roomData.append('amenities', formData.amenities.split(',').map(item => item.trim()).filter(Boolean).join(','));

    roomData.append('description', formData.description);
    roomData.append('isAvailable', formData.isAvailable);

    roomData.append('roomImage', selectedFile);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      await axios.post('http://localhost:5000/api/rooms', roomData, config);
      alert('Room added successfully!');
      navigate('/owner/manage-rooms');
    } catch (err) {
      console.error('Error adding room:', err.response?.data?.message || err.message);
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).map(val => val.message);
        setError(`Validation failed: ${validationErrors.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Failed to add room.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="page-container add-room-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Add New Room</h2>
      <form className="room-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
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

        <div className="form-group">
          <label htmlFor="roomImage" className="file-upload-label">Upload Room Photo:</label>
          <input type="file" id="roomImage" accept="image/*" onChange={handleFileChange} required disabled={loading} />
          <p className="form-hint">Select a single image file for the room.</p>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={formData.description} onChange={handleChange} rows="4" disabled={loading}></textarea>
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={handleChange} disabled={loading} />
          <label htmlFor="isAvailable" className="checkbox-label">Available for Booking</label>
        </div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Adding Room...' : 'Add Room'}
        </button>
      </form>
    </div>
  );
}

export default AddRoomPage;