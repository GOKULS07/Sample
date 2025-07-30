import React, { useState, useEffect } from 'react'; // React hooks for managing data and side effects
import './BookingPage.css'; // Our specific styles for this page
import { useNavigate, useParams, useLocation } from 'react-router-dom'; // Tools for navigation, URL params, and location state
import axios from 'axios'; // Our tool for talking to the backend
import { useAuth } from '../../contexts/AuthContext'; // Our custom hook to get authentication info
import DatePicker from 'react-datepicker'; // The calendar component
import 'react-datepicker/dist/react-datepicker.css'; // Styles for the calendar

// This is the Booking Page component!
// It's where customers confirm a room booking. They pick dates, see the price, and finalize.
function BookingPage() {
  const navigate = useNavigate(); // For jumping to other pages
  const { id: roomId } = useParams(); // Grabs the room's ID from the URL
  const location = useLocation(); // Helps us access state passed from previous pages
  const { user, isAuthenticated } = useAuth(); // Checks who's logged in and their status

  // States to hold room data and manage the booking process
  const [room, setRoom] = useState(null); // The details of the room being booked
  const [loading, setLoading] = useState(true); // True when we're waiting for initial data
  const [bookingLoading, setBookingLoading] = useState(false); // True when busy confirming booking
  const [error, setError] = useState(null); // Any problems?
  const [message, setMessage] = useState(null); // Success messages

  // States for date selection and calculation
  const [startDate, setStartDate] = useState(null); // The chosen check-in date
  const [endDate, setEndDate] = useState(null); // The chosen check-out date
  const [totalPrice, setTotalPrice] = useState(0); // Calculated total price
  const [totalNights, setTotalNights] = useState(0); // Calculated total nights
  const [bookedDates, setBookedDates] = useState([]); // Dates already taken for this room

  // When the page loads, or room ID/auth status changes, let's fetch room details and its bookings
  useEffect(() => {
    const fetchRoomAndBookings = async () => {
      try {
        // Fetch the specific room details from our backend
        const roomResponse = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
        setRoom(roomResponse.data.data);

        // Fetch all existing bookings for this room to disable those dates in the calendar
        const bookingsResponse = await axios.get(`http://localhost:5000/api/bookings/room/${roomId}`);
        const bookings = bookingsResponse.data.data;

        // Convert booking date ranges into a list of individual dates to disable
        const datesToDisable = [];
        bookings.forEach(booking => {
          let currentDate = new Date(booking.checkInDate);
          const end = new Date(booking.checkOutDate);
          while (currentDate < end) {
            datesToDisable.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
        setBookedDates(datesToDisable);
        setLoading(false); // Done loading initial data

      } catch (err) {
        console.error('Problem fetching room or bookings for booking page:', err);
        setError('Couldn\'t load room details or availability. Room might not exist.');
        setLoading(false);
        // If unauthorized, redirect to login page (passing the current page's path)
        if (err.response && err.response.status === 401) {
          navigate('/login', { state: { from: `/customer/book/${roomId}` } });
        }
      }
    };
    fetchRoomAndBookings();
  }, [roomId, navigate]); // Runs when room ID or navigate function changes

  // This effect recalculates the total price and nights whenever dates or room details change
  useEffect(() => {
    if (room && startDate && endDate) {
      const start = startDate;
      const end = endDate;

      // Basic date validation: check-out must be after check-in
      if (start.getTime() >= end.getTime()) {
        setTotalPrice(0);
        setTotalNights(0);
        setError('Check-out date must be after check-in date.');
        return;
      }

      // Calculate the number of nights
      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));

      // Validate against room's min/max booking days
      if (diffDays < room.minBookingDays || diffDays > room.maxBookingDays) {
        setError(`Booking must be between ${room.minBookingDays} and ${room.maxBookingDays} nights.`);
        setTotalPrice(0);
        setTotalNights(0);
        return;
      }

      setTotalNights(diffDays); // Update total nights
      setTotalPrice(diffDays * room.dailyRentAmount); // Calculate total price
      setError(null); // Clear any errors if dates are valid
    } else {
      setTotalPrice(0);
      setTotalNights(0);
      setError(null);
    }
  }, [startDate, endDate, room]); // Runs when these values change

  // Handler for when dates are selected in the DatePicker
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // What happens when the "Confirm Booking" button is clicked
  const handleConfirmBooking = async () => {
    // Frontend validation before sending to backend
    if (!startDate || !endDate) {
      setError('Please select both check-in and check-out dates.');
      return;
    }
    if (totalPrice <= 0 || error) {
      setError('Please select valid dates for booking.');
      return;
    }
    // Check if user is authenticated (should be handled by ProtectedRoute but good redundancy)
    if (!isAuthenticated || !user) {
      alert('You must be logged in to book a room. Please log in or register.');
      navigate('/login', { state: { from: `/customer/book/${roomId}` } }); // Redirect to login
      return;
    }

    // Frontend check for overlapping booked dates (backend does a stricter check)
    const isOverlap = bookedDates.some(bookedDate => {
      const selectedStart = startDate.setHours(0,0,0,0);
      const selectedEnd = endDate.setHours(0,0,0,0);
      const bDate = bookedDate.setHours(0,0,0,0);
      return (bDate >= selectedStart && bDate < selectedEnd);
    });

    if (isOverlap) {
      setError('Selected dates overlap with an already booked period. Please choose different dates.');
      return;
    }

    setBookingLoading(true); // Show loading state on the button
    setError(null); // Clear errors
    setMessage(null); // Clear messages

    // Prepare booking data to send to the backend
    const bookingData = {
      roomId: room._id,
      checkInDate: startDate.toISOString(), // Send as ISO string for date consistency
      checkOutDate: endDate.toISOString(),
      totalPrice,
    };

    try {
      // Send the booking request to the backend
      // This hits: POST /api/bookings (protected, requires customer role)
      const { data } = await axios.post('http://localhost:5000/api/bookings', bookingData);
      setMessage(data.message || 'Booking confirmed successfully!'); // Set success message
      alert('Booking confirmed successfully!'); // Show native alert
      navigate('/customer/bookings'); // Go to booking history
    } catch (err) {
      console.error('Error confirming booking:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to confirm booking.'); // Set error message
      alert(err.response?.data?.message || 'Failed to confirm booking.'); // Show native alert for error
    } finally {
      setBookingLoading(false); // Stop loading animation
    }
  };

  // Function to go back to the previous page in history
  const handleBack = () => {
    navigate(-1);
  };

  // Function to disable past dates in the calendar
  const filterPassedDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    return date >= today; // Only allow today or future dates
  };

  // Conditional rendering based on loading, error, or data availability
  if (loading) {
    return <div className="page-container page-title">Loading Booking Page...</div>;
  }

  // Display error if initial room data fetch failed
  if (error && !message && !room) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  // Display "Room not found" if no room data is available
  if (!room) {
    return <div className="page-container page-title">Room not found for booking.</div>;
  }

  return (
    <div className="page-container booking-page-container">
      <button onClick={handleBack} className="back-button">← Back</button> {/* Back button */}
      <h2 className="page-title">Confirm Your Booking</h2> {/* Page title */}

      {/* Display general error or success messages */}
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {/* Card displaying details of the room being booked */}
      <div className="booking-summary-card">
        <h3>Room Details</h3>
        <div className="detail-row">
          <span>Room Name:</span> <strong>{room.name}</strong>
        </div>
        <div className="detail-row">
          <span>Daily Rent:</span> <strong>₹{room.dailyRentAmount}</strong>
        </div>
        <div className="detail-row">
          <span>Min Nights:</span> <strong>{room.minBookingDays}</strong>
        </div>
        <div className="detail-row">
          <span>Max Nights:</span> <strong>{room.maxBookingDays}</strong>
        </div>
      </div>

      {/* Section for the Availability Calendar */}
      <div className="availability-full-width-section">
        <h3 className="availability-title">Select Booking Dates</h3>
        <div className="availability-calendar-wrapper">
          <DatePicker
            selected={startDate} // Current selected check-in date
            onChange={handleDateChange} // Function to call when dates are selected
            startDate={startDate} // Start of the selected date range
            endDate={endDate} // End of the selected date range
            selectsRange // Enables selecting a date range
            inline // Displays the calendar directly on the page
            minDate={new Date()} // Disables dates before today
            excludeDates={bookedDates} // Disables dates that are already booked
            filterDate={filterPassedDates} // Custom filter to prevent selection of past days
            monthsShown={2} // Shows two months simultaneously
          />
        </div>
      </div>

      {/* Section for displaying total payment and the confirmation button */}
      <div className="payment-info-section">
        <h3>Total Payment</h3>
        <div className="detail-row total-price-row">
          <span>Total Nights:</span> <strong>{totalNights}</strong>
        </div>
        <div className="detail-row total-price-row">
          <span>Subtotal:</span> <strong className="total-price">₹{totalPrice}</strong>
        </div>
        <p className="payment-note">Additional taxes and fees may apply.</p>
        <button onClick={handleConfirmBooking} className="primary-button confirm-booking-button" disabled={bookingLoading || totalPrice <= 0 || !!error}>
          {bookingLoading ? 'Confirming...' : 'Confirm Booking'} {/* Button text changes when busy */}
        </button>
      </div>
    </div>
  );
}

export default BookingPage;