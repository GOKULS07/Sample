import React, { useState, useEffect } from 'react';
import './BookingPage.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 

function BookingPage() {
  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalNights, setTotalNights] = useState(0);
  const [bookedDates, setBookedDates] = useState([]);


  useEffect(() => {
    const fetchRoomAndBookings = async () => {
      try {
        const roomResponse = await axios.get(`https://room-booker.onrender.com/api/rooms/${roomId}`);
        setRoom(roomResponse.data.data);

        const bookingsResponse = await axios.get(`https://room-booker.onrender.com/api/bookings/room/${roomId}`);
        const bookings = bookingsResponse.data.data;

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
        setLoading(false);

      } catch (err) {
        console.error('Error fetching room or bookings for booking page:', err);
        setError('Failed to load room details or availability for booking. Room might not exist.');
        setLoading(false);
        if (err.response && err.response.status === 401) {
          navigate('/login', { state: { from: `/customer/book/${roomId}` } });
        }
      }
    };
    fetchRoomAndBookings();
  }, [roomId, navigate]);


  useEffect(() => {
    if (room && startDate && endDate) {
      const start = startDate;
      const end = endDate;

      if (start.getTime() >= end.getTime()) {
        setTotalPrice(0);
        setTotalNights(0);
        setError('Check-out date must be after check-in date.');
        return;
      }

      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));

      if (diffDays < room.minBookingDays || diffDays > room.maxBookingDays) {
        setError(`Booking must be between ${room.minBookingDays} and ${room.maxBookingDays} nights.`);
        setTotalPrice(0);
        setTotalNights(0);
        return;
      }

      setTotalNights(diffDays);
      setTotalPrice(diffDays * room.dailyRentAmount);
      setError(null);
    } else {
      setTotalPrice(0);
      setTotalNights(0);
      setError(null);
    }
  }, [startDate, endDate, room]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleConfirmBooking = async () => {
    if (!startDate || !endDate) {
      setError('Please select both check-in and check-out dates.');
      return;
    }
    if (totalPrice <= 0 || error) {
      setError('Please select valid dates for booking.');
      return;
    }
    if (!isAuthenticated || !user) {
      alert('You must be logged in to book a room.');
      navigate('/login', { state: { from: `/customer/book/${roomId}` } });
      return;
    }


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


    setBookingLoading(true);
    setError(null);
    setMessage(null);

    const bookingData = {
      roomId: room._id,
      checkInDate: startDate.toISOString(),
      checkOutDate: endDate.toISOString(),
      totalPrice,
    };

    try {
      const { data } = await axios.post('https://room-booker.onrender.com/api/bookings', bookingData);
      setMessage(data.message || 'Booking confirmed successfully!');
      alert('Booking confirmed successfully!');
      navigate('/customer/bookings');
    } catch (err) {
      console.error('Error confirming booking:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to confirm booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const filterPassedDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  if (loading) {
    return <div className="page-container page-title">Loading Booking Page...</div>;
  }

  if (error && !message && !room) {
    return <div className="page-container page-title error-message">{error}</div>;
  }

  if (!room) {
    return <div className="page-container page-title">Room not found for booking.</div>;
  }

  return (
    <div className="page-container booking-page-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2 className="page-title">Confirm Your Booking</h2>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

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

      <div className="availability-full-width-section"> {/* Reuse styling for calendar section */}
        <h3 className="availability-title">Select Booking Dates</h3>
        <div className="availability-calendar-wrapper">
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            minDate={new Date()}
            excludeDates={bookedDates}
            filterDate={filterPassedDates}
            monthsShown={2}
          />
        </div>
      </div>

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
          {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

export default BookingPage;
