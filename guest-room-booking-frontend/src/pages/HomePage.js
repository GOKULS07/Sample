import React from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Discover Your Perfect Stay, Effortlessly.</h1>
          <p>Seamlessly connect with house owners for short-term room rentals. Your ideal guest experience starts here.</p>
          <div className="hero-buttons">
            <Link to="/rooms" className="primary-button hero-button-primary">Explore Rooms</Link>
           
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-title">Why Choose Room Booker?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✨</div>
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
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Browse & Discover</h3>
            <p>Explore a wide array of unique rooms tailored to your needs and preferences.</p>
          </div>
          <div className="step-arrow">→</div>
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

      <section className="cta-section">
        <h2 className="section-title cta-title">Ready to Experience Seamless Stays?</h2>
        <div className="cta-buttons">
          <Link to="/rooms" className="primary-button cta-button">Find a Room Today</Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;