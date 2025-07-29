const express = require('express');
const { registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); // Get logged in user's profile
router.put('/profile', protect, updateProfile); // Update logged in user's profile

module.exports = router;