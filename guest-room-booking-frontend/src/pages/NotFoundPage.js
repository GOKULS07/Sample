import React from 'react'; // Just pulling in React
import { Link } from 'react-router-dom'; // For linking back to other pages
import './NotFoundPage.css'; // Our specific styles for this page

// This is our 404 Not Found page component.
// It shows up when someone types a wrong address in their browser.
function NotFoundPage() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1> {/* The classic "404" number */}
      <p className="not-found-message">Oops! The page you're looking for doesn't exist.</p> {/* A friendly message */}
      <Link to="/" className="not-found-button">Go to Home</Link> {/* A button to send them back to the main page */}
    </div>
  );
}

export default NotFoundPage; // Making this component available