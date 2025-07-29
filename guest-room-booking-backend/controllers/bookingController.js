const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

const createBooking = async (req, res) => {
  const { roomId, checkInDate, checkOutDate, totalPrice } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Convert date strings to Date objects for comparison and storage
    const parsedCheckInDate = new Date(checkInDate);
    const parsedCheckOutDate = new Date(checkOutDate);

    // Basic date validation (already done on frontend, but good to double check)
    if (parsedCheckInDate >= parsedCheckOutDate) {
        return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    // --- More robust availability check (backend validation) ---
    // This is crucial to prevent double bookings
    const overlappingBookings = await Booking.find({
        room: roomId,
        status: { $in: ['pending', 'confirmed'] }, // Only consider active bookings
        $or: [
            // Case 1: New booking starts within an existing booking
            { checkInDate: { $lt: parsedCheckOutDate }, checkOutDate: { $gt: parsedCheckInDate } }
            // More complex overlaps can be handled here if needed, e.g. new booking fully
            // encloses existing one, or vice versa. The above $or condition covers most.
        ]
    });

    if (overlappingBookings.length > 0) {
        return res.status(409).json({ message: 'Room is already booked for part of the selected dates.' });
    }
    // --- End robust availability check ---

    const booking = await Booking.create({
      room: roomId,
      customer: req.user.id,
      owner: room.owner,
      checkInDate: parsedCheckInDate,
      checkOutDate: parsedCheckOutDate,
      totalPrice,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: booking });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
                                  .populate('room', 'name dailyRentAmount photos')
                                  .sort({ checkInDate: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ message: error.message });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const ownerRooms = await Room.find({ owner: req.user.id }).select('_id');
    const roomIds = ownerRooms.map(room => room._id);

    const bookings = await Booking.find({ room: { $in: roomIds } })
                                  .populate('room', 'name dailyRentAmount')
                                  .populate('customer', 'email mobileNumber')
                                  .sort({ checkInDate: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    res.status(500).json({ message: error.message });
  }
};

// New controller function to get bookings for a specific room
const getBookingsByRoomId = async (req, res) => {
    try {
        const { roomId } = req.params;
        const bookings = await Booking.find({ room: roomId, status: { $in: ['pending', 'confirmed'] } })
                                      .select('checkInDate checkOutDate'); // Only need dates
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error("Error fetching bookings by room ID:", error);
        res.status(500).json({ message: error.message });
    }
};


const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id).populate('room', 'owner');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.room.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking status updated', data: booking });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.customer.toString() !== req.user.id.toString()) {
            return res.status(401).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking cannot be cancelled now.' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });

    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBookingsByRoomId, // Export the new function
  updateBookingStatus,
  cancelBooking
};