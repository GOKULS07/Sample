import React, { useState } from 'react';
import './LoginPage.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      alert('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const { success, user, message } = await login(email, password);

    if (success && user) {
      if (from && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true });
      } else if (user.role === 'house_owner') {
        navigate('/owner/dashboard', { replace: true });
      } else if (user.role === 'customer') {
        navigate('/customer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      alert(message || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
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
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </form>
    </div>
  );
}

export default LoginPage;