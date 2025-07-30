const mongoose = require('mongoose'); // Pull in Mongoose, our tool for working with MongoDB
const bcrypt = require('bcryptjs'); // Used for securely hashing passwords
const jwt = require('jsonwebtoken'); // For creating JSON Web Tokens (our login "tickets")

// This is our User blueprint (schema) for how user data will look in the database.
// It defines what fields a user has and their types.
const UserSchema = new mongoose.Schema({
  email: {
    type: String, // It's text
    required: true, // You can't create a user without an email
    unique: true, // Each email must be unique
    trim: true, // Gets rid of extra spaces around the email
    lowercase: true // Stores email in all small letters for consistency
  },
  password: {
    type: String, // Password will be stored as text (but a hashed version!)
    required: true // Can't create a user without a password
  },
  mobileNumber: {
    type: String, // Mobile number as text
    required: true, // Must have a mobile number
    unique: true, // Each mobile number must be unique
    trim: true // Removes extra spaces
  },
  role: {
    type: String, // User's role (like customer or house owner)
    enum: ['customer', 'house_owner'], // It can ONLY be 'customer' OR 'house_owner'
    required: true // Every user must have a role
  }
}, {
  timestamps: true // Mongoose will automatically add 'createdAt' and 'updatedAt' dates
});

// A little magic trick before saving a user: hash their password!
// This runs BEFORE a user document is actually saved to the database.
UserSchema.pre('save', async function(next) {
  // If the password hasn't been changed, no need to hash it again, just move on
  if (!this.isModified('password')) {
    return next();
  }
  // Generate a random "salt" (a unique string to mix with the password for hashing)
  const salt = await bcrypt.genSalt(10); // 10 is a good "strength" level
  // Hash the user's password with the salt and store the hashed version
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Go to the next middleware/save operation
});

// A helpful method we add to a User document: compare a plain password to the hashed one
// This is used when a user tries to log in.
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // Compare the plain password they typed with the hashed one in the database
  return await bcrypt.compare(enteredPassword, this.password);
};

// Another helpful method: create a JSON Web Token (JWT) for a user
// This "ticket" tells the frontend that the user is authenticated.
UserSchema.methods.getSignedJwtToken = function() {
  // Sign a new token with:
  // - The user's ID and role (important info for later checks)
  // - Our secret key from .env (only our server knows this!)
  // - An expiration time (token is valid for 1 hour)
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '1h' // Token expires in 1 hour for security
  });
};

// Create our User model from the schema
const User = mongoose.model('User', UserSchema);

module.exports = User; // Make the User model available to other parts of our app