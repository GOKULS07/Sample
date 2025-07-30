import React, { useState, useEffect } from 'react';
import './AddRoomPage.css'; 
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; 

function EditRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [currentPhotos, setCurrentPhotos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const { data } = await axios.get(`https://room-booker.onrender.com/api/rooms/${id}`);
        const room = data.data;
        setFormData({
          name: room.name || '',
          floorSize: room.floorSize || '',
          numberOfBeds: room.numberOfBeds || '',
          amenities: room.amenities.join(', ') || '',
          dailyRentAmount: room.dailyRentAmount || '',
          minBookingDays: room.minBookingDays || '',
          maxBookingDays: room.maxBookingDays || '',
          description: room.description || '',
          isAvailable: room.isAvailable,
        });
        setCurrentPhotos(room.photos || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching room for edit:', err);
        setError('Failed to load room data for editing.');
        setLoading(false);
      }
    };
    fetchRoomData();
  }, [id]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

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

    if (selectedFile) {
      roomData.append('roomImage', selectedFile);
    } else {
      roomData.append('photos', JSON.stringify(currentPhotos));
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      await axios.put(`http://localhost:5000/api/rooms/${id}`, roomData, config);
      alert('Room updated successfully!');
      navigate('/owner/manage-rooms');
    } catch (err) {
      console.error('Error updating room:', err.response?.data?.message || err.message);
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).map(val => val.message);
        setError(`Validation failed: ${validationErrors.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Failed to update room.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="page-container page-title">Loading Room Data...</div>;
  }

  if (error) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container add-room-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Edit Room: {formData.name}</h2>
      <form className="room-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="name">Room Name:</label>
          <input type="text" id="name" value={formData.name} onChange={handleChange} required disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="floorSize">Floor Size (sq ft):</label>
          <input type="number" id="floorSize" value={formData.floorSize} onChange={handleChange} required disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="numberOfBeds">Number of Beds:</label>
          <input type="number" id="numberOfBeds" value={formData.numberOfBeds} onChange={handleChange} required disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="amenities">Amenities (comma-separated):</label>
          <input type="text" id="amenities" value={formData.amenities} onChange={handleChange} placeholder="e.g., Wi-Fi, AC, Private Bath" disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="dailyRentAmount">Daily Rent (₹):</label>
          <input type="number" id="dailyRentAmount" value={formData.dailyRentAmount} onChange={handleChange} required disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="minBookingDays">Minimum Booking Days:</label>
          <input type="number" id="minBookingDays" value={formData.minBookingDays} onChange={handleChange} required disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="maxBookingDays">Maximum Booking Days:</label>
          <input type="number" id="maxBookingDays" value={formData.maxBookingDays} onChange={handleChange} required disabled={submitting} />
        </div>

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

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={formData.description} onChange={handleChange} rows="4" disabled={submitting}></textarea>
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={handleChange} disabled={submitting} />
          <label htmlFor="isAvailable" className="checkbox-label">Available for Booking</label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditRoomPage;
