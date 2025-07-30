import React, { useState } from 'react'; // React hooks for managing state
import './LoginPage.css'; // Our specific styles for the login page
import { useAuth } from '../contexts/AuthContext'; // Our custom hook to handle login logic
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Tools for navigating pages and getting URL info

// This is our Login Page component.
// It handles user input for email and password, then tries to log them in.
function LoginPage() {
  // State variables for the email and password inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Helps show a loading state on the button

  const { login } = useAuth(); // Grabs our login function from the authentication context
  const navigate = useNavigate(); // Lets us jump to different pages after login
  const location = useLocation(); // Helps us know if the user was trying to reach a specific page before login
  const from = location.state?.from?.pathname || '/'; // The page the user was trying to access, or just '/' if none

  // What happens when the login form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the browser from doing its default form submission
    setLoading(true); // Shows that we're busy trying to log in

    // Basic check: make sure both fields are filled
    if (!email || !password) {
      alert('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Call our login function from AuthContext, which talks to the backend
    const { success, user, message } = await login(email, password);

    if (success && user) {
      // If login worked, figure out where to send the user
      if (from && from !== '/login' && from !== '/register') {
        // If they came from a specific page (and it wasn't login/register), send them back there
        navigate(from, { replace: true });
      } else if (user.role === 'house_owner') {
        // If they're an owner, send them to their dashboard
        navigate('/owner/dashboard', { replace: true });
      } else if (user.role === 'customer') {
        // If they're a customer, send them to their dashboard
        navigate('/customer/dashboard', { replace: true });
      } else {
        // Otherwise, just send them to the home page
        navigate('/', { replace: true });
      }
    } else {
      // If login failed, show an alert with the error message
      alert(message || 'Login failed. Please check your credentials.');
    }
    setLoading(false); // Done trying to log in, remove loading state
  };

  // The visual layout of our login page
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}> {/* Our login form */}
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input
            type="email" // Ensures it's an email input
            id="email" // Links to the label
            value={email} // The current value from state
            onChange={(e) => setEmail(e.target.value)} // Updates state when input changes
            required // Makes it a required field
            disabled={loading} // Disables input while loading
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password" // Hides text as user types
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'} {/* Button text changes based on loading state */}
        </button>
        {/* Link to the registration page */}
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </form>
    </div>
  );
}

export default LoginPage; // Make this component available for use in other files