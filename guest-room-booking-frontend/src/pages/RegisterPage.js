import React, { useState } from 'react'; // React hooks for managing data on the page
import './LoginPage.css'; // Using the same styles as the login page for consistency
import { useAuth } from '../contexts/AuthContext'; // Our custom hook to handle registration logic
import { useNavigate, Link } from 'react-router-dom'; // Tools for moving between pages and creating links

// This is our Register Page component.
// It allows new users to create an account, choosing if they are a customer or a house owner.
function RegisterPage() {
  // State variables to hold the values from our input fields
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState(''); // Mobile number field
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role is 'customer'
  const [loading, setLoading] = useState(false); // Helps show a loading state on the button

  const { register } = useAuth(); // Grabs our register function from the authentication context
  const navigate = useNavigate(); // Lets us jump to other pages after successful registration

  // What happens when the registration form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the browser's default form submission
    setLoading(true); // Shows that we're busy trying to register

    // Basic check: make sure all required fields are filled
    if (!email || !mobile || !password || !role) {
      alert('Please fill in all required fields.');
      setLoading(false);
      return; // Stop here if validation fails
    }

    // Prepare the user data to send to the backend
    const userData = { email, mobile, password, role };
    // Call our register function from AuthContext, which talks to the backend
    const { success, message } = await register(userData);

    if (success) {
      // If registration worked, show a success message and send them to the login page
      alert(message || 'Registration successful! Please log in.');
      navigate('/login');
    } else {
      // If registration failed, show an alert with the error message
      alert(message || 'Registration failed. Please try again.');
    }
    setLoading(false); // Done trying to register, remove loading state
  };

  // The visual layout of our registration form
  return (
    <div className="login-container"> {/* Reusing the same container style as the login page */}
      <h2>Register</h2> {/* Title for the registration page */}
      <form className="login-form" onSubmit={handleSubmit}> {/* Our registration form */}
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input
            type="email" // Ensures it's an email input
            id="email" // Links this input to the label
            value={email} // The current value from state
            onChange={(e) => setEmail(e.target.value)} // Updates state when input changes
            required // Makes it a required field
            disabled={loading} // Disables input while busy
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">Mobile Number:</label>
          <input
            type="tel" // Specifies it's a telephone number input
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
            type="password" // Hides text as user types
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
            value={role} // The currently selected role
            onChange={(e) => setRole(e.target.value)} // Updates role in state
            disabled={loading}
          >
            <option value="customer">Customer</option> {/* Option for customer role */}
            <option value="house_owner">House Owner</option> {/* Option for house owner role */}
          </select>
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'} {/* Button text changes based on loading */}
        </button>
        {/* Link back to the login page */}
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </form>
    </div>
  );
}

export default RegisterPage; // Making this component available for our app