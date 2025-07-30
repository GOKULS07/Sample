import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; 

function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth(); 
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { 
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get('https://room-booker.onrender.com/api/auth/me');
        setFormData({
          fullName: data.data.fullName || 'N/A', 
          email: data.data.email,
          mobileNumber: data.data.mobileNumber,
          password: '', 
          newPassword: '',
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [user, navigate, logout]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const updateData = {
      email: formData.email,
      mobileNumber: formData.mobileNumber,
    };
    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }
   

    try {
      const { data } = await axios.put('https://room-booker.onrender.com/api/auth/profile', updateData);
      setMessage(data.message || 'Profile updated successfully!');
      setFormData({ ...formData, password: '', newPassword: '' });
    } catch (err) {
      console.error('Error updating profile:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="page-container page-title">Loading Profile...</div>;
  }

  if (error && !message) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  return (
    <div className="page-container profile-page-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">My Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
       
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input type="email" id="email" value={formData.email} onChange={handleChange} required disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number:</label>
          <input type="tel" id="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required disabled={submitting} />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password (leave blank to keep current):</label>
          <input type="password" id="newPassword" value={formData.newPassword} onChange={handleChange} disabled={submitting} />
        </div>
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
