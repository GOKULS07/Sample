import React from 'react'; // Just pulling in React
import { Navigate, useLocation } from 'react-router-dom'; // Tools for redirecting and getting current URL info
import { useAuth } from '../contexts/AuthContext'; // Our custom hook to check who's logged in and their role

// This is our ProtectedRoute component.
// It's like a bouncer for our web pages! It checks if a user is logged in
// and has the right "role" before letting them into a specific page.
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Grab the user's login status and user object from our AuthContext
  const { user, isAuthenticated } = useAuth();
  const location = useLocation(); // Helps us know which page the user was trying to reach

  // First check: Is the user even logged in?
  if (!isAuthenticated) {
    // If not logged in, send them to the login page.
    // We also save the page they *were* trying to reach (in 'state.from')
    // so we can send them back there after they successfully log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Second check: Is the user logged in, but do they have the *wrong* role for this page?
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If they're an owner but trying to access a customer page (or vice-versa),
    // we send them to their own dashboard.
    if (user.role === 'house_owner') {
      return <Navigate to="/owner/dashboard" replace />; // Send owners to their dashboard
    } else if (user.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />; // Send customers to their dashboard
    }
    // If their role is something unexpected, just send them home.
    return <Navigate to="/" replace />; 
  }

  // If all checks pass, the user is authorized, so we let them see the page!
  return children; // Render the component (the page) that this ProtectedRoute is wrapping
};

export default ProtectedRoute; // Make this component available