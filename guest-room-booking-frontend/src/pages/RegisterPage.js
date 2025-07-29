import React, { useState } from 'react';
import './LoginPage.css'; // Reusing CSS from Login Page
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState(''); // Retained as 'mobile' for clarity
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !mobile || !password || !role) {
      alert('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const userData = { email, mobile, password, role }; // mobile to match backend mobileNumber
    const { success, message } = await register(userData);

    if (success) {
      alert(message || 'Registration successful! Please log in.');
      navigate('/login');
    } else {
      alert(message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">Mobile Number:</label>
          <input
            type="tel" // Changed to tel type
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Register as:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="customer">Customer</option>
            <option value="house_owner">House Owner</option>
          </select>
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </form>
    </div>
  );
}

export default RegisterPage;