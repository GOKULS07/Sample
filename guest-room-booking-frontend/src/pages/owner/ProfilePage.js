import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './ProfilePage.css'; // Our specific styles for the profile page
import { useNavigate } from 'react-router-dom'; // For navigating between pages
import axios from 'axios'; // Our tool for talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook to handle authentication

// This is the Profile Page component.
// It lets a logged-in user view and update their personal details like email and mobile number.
function ProfilePage() {
  const navigate = useNavigate(); // Lets us jump to other pages
  // Grabbing user info, token (though not directly used here), and logout function from AuthContext
  const { user, token, logout } = useAuth(); 
  
  // State to hold the form data (profile fields)
  const [formData, setFormData] = useState({
    fullName: '', // Placeholder for a name, if you add it to the User model later
    email: '',
    mobileNumber: '',
    password: '', // Current password (not pre-filled for security)
    newPassword: '', // For when the user wants to change their password
  });

  // States to manage the page's status and user feedback
  const [loading, setLoading] = useState(true); // True when initially fetching profile data
  const [submitting, setSubmitting] = useState(false); // True when saving changes to the profile
  const [error, setError] = useState(null); // Any problems? They go here.
  const [message, setMessage] = useState(null); // Success messages live here.

  // When the page loads, let's fetch the current user's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      // If no user is logged in (though ProtectedRoute should handle this), stop loading.
      if (!user) { 
        setLoading(false);
        return;
      }
      try {
        // Ask our backend for the logged-in user's profile
        // This hits: GET /api/auth/me (protected route)
        const { data } = await axios.get('https://room-booker.onrender.com/api/auth/me');
        // Fill the form with the data we got from the server
        const { data } = await axios.get('https://room-booker.onrender.com/api/auth/me');
        setFormData({
          fullName: data.data.fullName || 'N/A', // If backend has full name, use it; otherwise N/A
          email: data.data.email,
          mobileNumber: data.data.mobileNumber,
          password: '', // Never pre-fill password fields for security!
          newPassword: '',
        });
        setLoading(false); // Done loading!
      } catch (err) {
        console.error('Problem fetching profile:', err);
        setError('Couldn\'t load profile data.'); // Show a friendly error message
        setLoading(false);
        // If the backend says we're unauthorized (e.g., token expired), log out and send to login
        if (err.response && err.response.status === 401) {
          logout(); // Calls our logout function
          navigate('/login'); // Sends user to login page
        }
      }
    };
    fetchProfile(); // Go get the profile data when the component first shows up
  }, [user, navigate, logout]); // Runs when user, navigate, or logout functions change

  // What happens when any input field changes
  const handleChange = (e) => {
    // Grab the input's ID, its value, type (e.g., text, checkbox), and checked state (for checkboxes)
    const { id, value, type, checked } = e.target;
    // Update the formData state based on which input changed
    setFormData({ 
      ...formData, // Keep existing form data
      [id]: type === 'checkbox' ? checked : value, // Update just the changed field
    });
  };

  // What happens when the profile update form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the browser's default form submission
    setSubmitting(true); // Shows a busy state on the button
    setError(null); // Clear previous errors
    setMessage(null); // Clear previous success messages

    // Prepare the data to send to the backend for updating the profile
    const updateData = {
      email: formData.email,
      mobileNumber: formData.mobileNumber,
    };
    // Only include the new password if the user actually typed one in
    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }
    // (If you add a 'fullName' field to your User model, you'd add it to updateData here)

    try {
      // Send a PUT request to update the profile
      // This hits: PUT /api/auth/profile (protected route)
      const { data } = await axios.put('https://room-booker.onrender.com/api/auth/profile', updateData);
      setMessage(data.message || 'Profile updated successfully!'); // Show success message
      // Clear password fields from state after successful update for security
      const { data } = await axios.put('https://room-booker.onrender.com/api/auth/profile', updateData);
      setMessage(data.message || 'Profile updated successfully!');
      setFormData({ ...formData, password: '', newPassword: '' });
    } catch (err) {
      console.error('Problem updating profile:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Couldn\'t update profile.'); // Show error message
    } finally {
      setSubmitting(false); // Turn off busy state
    }
  };

  // Simple function to go back to the previous page
  const handleBack = () => {
    navigate(-1);
  };

  // Show a loading screen while we fetch initial profile data
  if (loading) {
    return <div className="page-container page-title">Loading Profile...</div>;
  }

  // If there's an error and no success message, show the error
  if (error && !message) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  // The visual layout of our profile page
  return (
    <div className="page-container profile-page-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">My Profile</h2> {/* Page title */}
      <form className="profile-form" onSubmit={handleSubmit}> {/* Our profile update form */}
        {error && <p className="error-message">{error}</p>} {/* Show error if any */}
        {message && <p className="success-message">{message}</p>} {/* Show success message if any */}
        
        {/* Email Address field */}
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input type="email" id="email" value={formData.email} onChange={handleChange} required disabled={submitting} />
        </div>
        {/* Mobile Number field */}
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number:</label>
          <input type="tel" id="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required disabled={submitting} />
        </div>
        {/* New Password field (optional) */}
        <div className="form-group">
          <label htmlFor="newPassword">New Password (leave blank to keep current):</label>
          <input type="password" id="newPassword" value={formData.newPassword} onChange={handleChange} disabled={submitting} />
        </div>
        {/* Save Profile button */}
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Profile'} {/* Button text changes when busy */}
        </button>
      </form>
    </div>
  );
}

<<<<<<< HEAD
export default ProfilePage; // Making this component available
=======
export default ProfilePage;
>>>>>>> 9ff74573d08bcf5d1c1b32543741782078399b66
