import React from 'react'; // Pulling in React to build our component
import './HomePage.css'; // Our specific styles for how this page looks
import { Link } from 'react-router-dom'; // This helps us link to other pages in our app

function HomePage() {
  return (
    <div className="home-container">
      {/* This is the big, eye-catching top section of our homepage */}
      <header className="hero-section">
        <div className="hero-overlay"></div> {/* A layer to make the background image stand out */}
        <div className="hero-content">
          <h1>Discover Your Perfect Stay, Effortlessly.</h1> {/* Main headline */}
          <p>Seamlessly connect with house owners for short-term room rentals. Your ideal guest experience starts here.</p>
          <div className="hero-buttons">
            <Link to="/rooms" className="primary-button hero-button-primary">Explore Rooms</Link> {/* Button to jump into Browse rooms */}
            
          </div>
        </div>
      </header>

      {/* This section highlights the key reasons why someone should choose our Room Booker app */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Room Booker?</h2> {/* Section title */}
        <div className="features-grid">
          {/* Each card here explains a benefit or feature */}
          <div className="feature-card">
            <div className="feature-icon">✨</div> {/* A little icon for the feature */}
            <h3>Curated Listings</h3>
            <p>Hand-picked rooms ensuring comfort, safety, and a delightful experience for every guest.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔑</div>
            <h3>Effortless Booking</h3>
            <p>Browse, select dates, and book your ideal room in just a few clicks. Simple and intuitive.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Trusted Community</h3>
            <p>Connect with verified house owners and guests, fostering a reliable and secure environment.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Seamless Management</h3>
            <p>Owners can easily list properties, manage bookings, and communicate with guests.</p>
          *</div>
        </div>
      </section>

      {/* This section guides users through how simple it is to use our service, step-by-step */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          {/* These cards represent each step in the user journey */}
          <div className="step-card">
            <div className="step-number">1</div> {/* The step number */}
            <h3>Browse & Discover</h3>
            <p>Explore a wide array of unique rooms tailored to your needs and preferences.</p>
          </div>
          <div className="step-arrow">→</div> {/* A little arrow connecting steps */}
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Select & Book</h3>
            <p>Choose your dates, confirm availability, and secure your reservation instantly.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Enjoy Your Stay</h3>
            <p>Arrive at your perfect room and experience a comfortable, hassle-free visit.</p>
          </div>
        </div>
      </section>

      {/* A final call-to-action section to encourage users to start finding rooms */}
      <section className="cta-section">
        <h2 className="section-title cta-title">Ready to Experience Seamless Stays?</h2>
        <div className="cta-buttons">
          <Link to="/rooms" className="primary-button cta-button">Find a Room Today</Link> {/* Button to find rooms */}
        </div>
      </section>
    </div>
  );
}

export default HomePage; // Making this component available for our app to use