const mongoose = require('mongoose'); // Pull in Mongoose, our tool for working with MongoDB

// This is our Booking blueprint (schema) for how booking data will look in the database.
// It defines what details each booking entry will have.
const BookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId, // This links to a specific Room document
    ref: 'Room', // Tells Mongoose it refers to the 'Room' model
    required: true // Every booking needs a room
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId, // This links to the User who made the booking
    ref: 'User', // Refers to the 'User' model
    required: true // Every booking needs a customer
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, // This links to the User who owns the room being booked
    ref: 'User', // Refers to the 'User' model
    required: true // Every booking needs an owner (of the room)
  },
  checkInDate: {
    type: Date, // The date the guest checks in
    required: true // Must have a check-in date
  },
  checkOutDate: {
    type: Date, // The date the guest checks out
    required: true // Must have a check-out date
  },
  totalPrice: {
    type: Number, // The total cost of the booking
    required: true // Must have a total price
  },
  status: {
    type: String, // The current state of the booking
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], // Can only be one of these specific values
    default: 'pending' // New bookings start as 'pending'
  }
}, {
  timestamps: true // Mongoose will automatically add 'createdAt' and 'updatedAt' dates
});

// Create our Booking model from the schema
const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking; // Make the Booking model available to other parts of our app