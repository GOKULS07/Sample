const express = require('express');
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer'); // Import multer
const path = require('path'); // For path.extname

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create 'uploads' directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    require('fs').mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir); // Files will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Multer upload middleware
// `roomImage` here must match the `name` attribute of the file input in your frontend
// and the field name used in `formData.append('roomImage', selectedFile)`
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
  }
}).single('roomImage'); // .single() for one file, 'roomImage' is the field name

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Protected routes (requires authentication)
router.post('/', protect, authorize('house_owner'), upload, createRoom); // Add upload middleware
router.put('/:id', protect, authorize('house_owner'), upload, updateRoom); // Add upload middleware
router.delete('/:id', protect, authorize('house_owner'), deleteRoom);
router.get('/owner-rooms/me', protect, authorize('house_owner'), getOwnerRooms);

module.exports = router;