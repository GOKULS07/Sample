const Booking = require('../models/Booking'); // Our Booking blueprint
const Room = require('../models/Room');     // Our Room blueprint
const User = require('../models/User');     // Our User blueprint (for getting owner/customer details)

// This function creates a brand new booking.
// It's called when a customer sends a POST request to /api/bookings.
const createBooking = async (req, res) => {
  // Grab booking details from what the customer sent
  const { roomId, checkInDate, checkOutDate, totalPrice } = req.body;

  try {
    // First, make sure the room actually exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Convert date strings from the frontend into proper Date objects for comparison and storage
    const parsedCheckInDate = new Date(checkInDate);
    const parsedCheckOutDate = new Date(checkOutDate);

    // Basic date validation: Check-out must be after check-in
    if (parsedCheckInDate >= parsedCheckOutDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    // --- Critical part: Check if the room is already booked for these dates ---
    // We look for any existing bookings for this room that are 'pending' or 'confirmed'
    // and whose dates overlap with the new requested booking dates.
    const overlappingBookings = await Booking.find({
      room: roomId,
      status: { $in: ['pending', 'confirmed'] }, // Only care about active bookings
      $or: [
        // This condition checks if the new booking's period overlaps with an existing one.
        // It's a common way to find overlaps in date ranges.
        { checkInDate: { $lt: parsedCheckOutDate }, checkOutDate: { $gt: parsedCheckInDate } }
      ]
    });

    if (overlappingBookings.length > 0) {
      // If we find any overlaps, tell the customer it's already booked
      return res.status(409).json({ message: 'Room is already booked for part of the selected dates.' });
    }
    // --- End of availability check ---

    // If everything looks good, create the new booking in the database
    const booking = await Booking.create({
      room: roomId,
      customer: req.user.id, // The customer's ID comes from the authenticated user (via protect middleware)
      owner: room.owner, // We get the owner's ID from the room details
      checkInDate: parsedCheckInDate,
      checkOutDate: parsedCheckOutDate,
      totalPrice,
      status: 'pending' // New bookings usually start as 'pending'
    });

    // Send back a success response with the new booking details
    res.status(201).json({ success: true, data: booking });

  } catch (error) {
    console.error("Problem creating booking:", error);
    res.status(500).json({ message: error.message });
  }
};

// This function gets all bookings for the currently logged-in customer.
// It's called when a customer sends a GET request to /api/bookings/customer/me.
const getMyBookings = async (req, res) => {
  try {
    // Find all bookings where the 'customer' field matches the authenticated user's ID.
    // We also "populate" the 'room' field to get its name, rent, and photos for display.
    const bookings = await Booking.find({ customer: req.user.id })
                                  .populate('room', 'name dailyRentAmount photos') // Get room details
                                  .sort({ checkInDate: -1 }); // Show newest bookings first

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("Problem fetching customer bookings:", error);
    res.status(500).json({ message: error.message });
  }
};

// This function gets all bookings related to the currently logged-in owner's rooms.
// It's called when an owner sends a GET request to /api/bookings/owner/me.
const getOwnerBookings = async (req, res) => {
  try {
    // First, find all the room IDs that belong to this owner
    const ownerRooms = await Room.find({ owner: req.user.id }).select('_id');
    const roomIds = ownerRooms.map(room => room._id); // Get just the IDs

    // Then, find all bookings that are for any of those room IDs.
    // We populate 'room' and 'customer' details for the owner to see.
    const bookings = await Booking.find({ room: { $in: roomIds } })
                                  .populate('room', 'name dailyRentAmount') // Get room details
                                  .populate('customer', 'email mobileNumber') // Get customer details
                                  .sort({ checkInDate: -1 }); // Show newest bookings first

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("Problem fetching owner bookings:", error);
    res.status(500).json({ message: error.message });
  }
};

// This function gets all bookings for a specific room.
// It's used by the frontend calendar to show which dates are taken.
// It's called by a GET request to /api/bookings/room/:roomId.
const getBookingsByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params; // Get the room ID from the URL
    // Find all active bookings for this specific room, and only grab the check-in/out dates
    const bookings = await Booking.find({ room: roomId, status: { $in: ['pending', 'confirmed'] } })
                                  .select('checkInDate checkOutDate'); // Only return these date fields

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Problem fetching bookings by room ID:", error);
    res.status(500).json({ message: error.message });
  }
};

// This function allows a room owner to update the status of a booking.
// It's called by a PUT request to /api/bookings/:id/status.
const updateBookingStatus = async (req, res) => {
  const { status } = req.body; // The new status (e.g., 'confirmed', 'completed')
  const { id } = req.params; // The ID of the booking to update

  try {
    // Find the booking and also get its associated room (to check owner)
    const booking = await Booking.findById(id).populate('room', 'owner');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: Make sure only the *owner of the room* can update this booking
    if (booking.room.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'You\'re not allowed to update this booking.' });
    }

    // Validate the new status: Is it one of our allowed statuses?
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    booking.status = status; // Update the booking's status
    await booking.save(); // Save changes to the database

    res.status(200).json({ success: true, message: 'Booking status updated', data: booking });

  } catch (error) {
    console.error("Problem updating booking status:", error);
    res.status(500).json({ message: error.message });
  }
};

// This function allows a customer to cancel their own booking.
// It's called by a PUT request to /api/bookings/:id/cancel.
const cancelBooking = async (req, res) => {
  const { id } = req.params; // The ID of the booking to cancel

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: Make sure only the *customer who made the booking* can cancel it
    if (booking.customer.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'You\'re not allowed to cancel this booking.' });
    }

    // Check if the booking can actually be cancelled (not already completed or cancelled)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking cannot be cancelled now.' });
    }

    booking.status = 'cancelled'; // Change status to 'cancelled'
    await booking.save(); // Save changes to the database

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });

  } catch (error) {
    console.error("Problem cancelling booking:", error);
    res.status(500).json({ message: error.message });
  }
};

// Export all our booking-related functions so they can be used by our routes
module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBookingsByRoomId, // Our new function for getting room-specific bookings
  updateBookingStatus,
  cancelBooking
};