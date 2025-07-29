import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated, isHouseOwner, isCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDisplayName = (email) => {
    if (!email) return '';
    return email.split('@')[0];
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Room Booker</Link>
      </div>

      {/* Main Navigation Links - will be centered */}
      <ul className="nav-main-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/rooms">Browse Rooms</Link></li>
        {/* Conditional "My Bookings" and "Profile" links will now appear here when authenticated */}
        {isAuthenticated && (
          <>
            {isCustomer && <li><Link to="/customer/dashboard">My Bookings</Link></li>}
            {isHouseOwner && <li><Link to="/owner/dashboard">My Rooms</Link></li>}
            <li><Link to={isHouseOwner ? "/owner/profile" : "/customer/profile"}>Profile</Link></li>
          </>
        )}
      </ul>

      {/* Auth/Logout Buttons - will be on the far right */}
      <ul className="nav-auth-links">
        {isAuthenticated ? (
          <li>
            <button onClick={handleLogout} className="navbar-logout-button">
              <span role="img" aria-label="user-icon">👤</span> {/* User emoji */}
              Logout ({getDisplayName(user?.email)})
            </button>
          </li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;