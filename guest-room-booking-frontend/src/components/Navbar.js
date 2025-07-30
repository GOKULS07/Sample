import React from 'react'; // Pulling in React to build our component
import { Link, useNavigate } from 'react-router-dom'; // Tools for linking and navigation between pages
import './Navbar.css'; // Our specific styles for the Navbar component
import { useAuth } from '../contexts/AuthContext'; // Our custom hook to check user login status and role

// This is our main navigation bar. It's visible across the app and changes based on who's logged in.
function Navbar() {
  // Grabbing user info, logout function, and authentication status from our AuthContext.
  // This tells us if someone is logged in, who they are (user object), and their specific role.
  const { user, logout, isAuthenticated, isHouseOwner, isCustomer } = useAuth();
  const navigate = useNavigate(); // A handy tool to send users to different pages programmatically.

  // What happens when the 'Logout' button is clicked.
  const handleLogout = () => {
    logout(); // Calls the logout function from our AuthContext to clear session data.
    navigate('/login'); // Redirects the user to the login page after logging out.
  };

  // A little helper function to get a shorter display name from the user's email.
  // For example, "gokuls.cs22" from "gokuls.cs22@bitsathy.ac.in".
  const getDisplayName = (email) => {
    if (!email) return ''; // If there's no email, just return an empty string.
    return email.split('@')[0]; // Splits the email at '@' and takes the first part.
  };

  return (
    <nav className="navbar">
      {/* This is our app's brand or logo section on the left */}
      <div className="nav-brand">
        <Link to="/">Room Booker</Link> {/* Clicks on this go to the homepage. */}
      </div>

      {/* These are the main navigation links, designed to be centered on larger screens. */}
      <ul className="nav-main-links">
        <li><Link to="/">Home</Link></li> {/* Link to the main homepage. */}
        <li><Link to="/rooms">Browse Rooms</Link></li> {/* Link to view all available rooms. */}
        
        {/* Conditional links: These only show up if a user is authenticated (logged in). */}
        {isAuthenticated && (
          <>
            {/* If the user is a customer, they see a link to 'My Bookings'. */}
            {isCustomer && <li><Link to="/customer/dashboard">My Bookings</Link></li>}
            {/* If the user is a house owner, they see a link to 'My Rooms' (Owner Dashboard). */}
            {isHouseOwner && <li><Link to="/owner/dashboard">My Rooms</Link></li>}
            {/* A 'Profile' link visible for both authenticated customers and owners.
                It directs them to their specific profile page based on their role. */}
            <li><Link to={isHouseOwner ? "/owner/profile" : "/customer/profile"}>Profile</Link></li>
          </>
        )}
      </ul>

      {/* These are the authentication/logout links, positioned on the far right. */}
      <ul className="nav-auth-links">
        {isAuthenticated ? ( // If a user is currently logged in...
          <li>
            {/* The 'Logout' button, showing a user emoji and their short display name. */}
            <button onClick={handleLogout} className="navbar-logout-button">
              <span role="img" aria-label="user-icon">👤</span> {/* A friendly user emoji. */}
              Logout ({getDisplayName(user?.email)}) {/* Displays "Logout (username)". */}
            </button>
          </li>
        ) : ( // Otherwise (if not logged in)...
          <>
            {/* Show 'Login' and 'Register' links. */}
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar; // Making this Navbar component available for our main App.