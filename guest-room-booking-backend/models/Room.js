const mongoose = require('mongoose'); // Pull in Mongoose, our tool for working with MongoDB

// This is our Room blueprint (schema) for how room data will look in the database.
// It defines what details each room listing will have.
const RoomSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId, // This links to the User who owns this room
    ref: 'User', // Tells Mongoose it refers to the 'User' model
    required: true // Every room needs an owner
  },
  name: {
    type: String, // The name of the room (e.g., "Cozy Apartment")
    required: true, // Must have a name
    trim: true // Removes extra spaces from the name
  },
  floorSize: {
    type: Number, // Size of the room in square feet
    required: true // Must have a floor size
  },
  numberOfBeds: {
    type: Number, // How many beds are in the room
    required: true // Must specify number of beds
  },
  amenities: {
    type: [String], // A list (array) of amenities (e.g., "Wi-Fi", "AC")
    default: [] // If no amenities are given, it's just an empty list
  },
  dailyRentAmount: {
    type: Number, // How much it costs to rent per day
    required: true // Must have a daily rent amount
  },
  minBookingDays: {
    type: Number, // Minimum nights a guest can book
    default: 1 // Defaults to 1 day
  },
  maxBookingDays: {
    type: Number, // Maximum nights a guest can book
    default: 30 // Defaults to 30 days (as per your project overview)
  },
  photos: {
    type: [String], // A list (array) of URLs to the room's photos
    default: [] // If no photos are given, it's an empty list
  },
  description: {
    type: String, // A short description of the room
    trim: true, // Removes extra spaces
    default: '' // Defaults to an empty description
  },
  isAvailable: {
    type: Boolean, // Whether the room is currently available for booking
    default: true // Rooms are available by default when listed
  }
}, {
  timestamps: true // Mongoose will automatically add 'createdAt' and 'updatedAt' dates for tracking
});

// Create our Room model from the schema
const Room = mongoose.model('Room', RoomSchema);

module.exports = Room; // Make the Room model available to other parts of our app