const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  floorSize: {
    type: Number,
    required: true
  },
  numberOfBeds: {
    type: Number,
    required: true
  },
  amenities: {
    type: [String],
    default: []
  },
  dailyRentAmount: {
    type: Number,
    required: true
  },
  minBookingDays: {
    type: Number,
    default: 1
  },
  maxBookingDays: {
    type: Number,
    default: 30
  },
  photos: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;