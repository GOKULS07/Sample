const express = require('express');
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBookingsByRoomId, // Import the new function
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Protected routes (requires authentication)
router.post('/', protect, authorize('customer'), createBooking);
router.get('/customer/me', protect, authorize('customer'), getMyBookings);
router.get('/owner/me', protect, authorize('house_owner'), getOwnerBookings);

// New route to get bookings for a specific room (public, but dates are just availability info)
router.get('/room/:roomId', getBookingsByRoomId); // Room availability is public info

router.put('/:id/status', protect, authorize('house_owner'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('customer'), cancelBooking);

module.exports = router;