const jwt = require('jsonwebtoken'); // Our tool for working with JSON Web Tokens (JWTs)
const User = require('../models/User'); // Our User model, so we can look up users by their ID

// This is a middleware function called 'protect'.
// Its job is to make sure only authenticated (logged-in) users can access certain routes.
const protect = async (req, res, next) => {
  let token; // This variable will hold the JWT from the request

  // We look for the token in the 'Authorization' header of the request.
  // It usually looks like: "Bearer YOUR_TOKEN_STRING_HERE"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // We grab just the token string (removing "Bearer ")
      token = req.headers.authorization.split(' ')[1];
      
      // Now, we verify that this token is valid using our secret key.
      // If it's valid, 'decoded' will contain the user's ID and role that we put in the token.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // We then find the user in our database using the ID from the token,
      // but we specifically *don't* select their password for security.
      // We attach this user object to the 'req' object so other functions (like controllers) can use it.
      req.user = await User.findById(decoded.id).select('-password');
      
      next(); // If everything passed, move on to the next function (the controller or another middleware)
    } catch (error) {
      console.error(error); // Log the specific error for debugging
      // If the token is invalid (e.g., wrong secret, expired), send a 401 Unauthorized response
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If there was no token found in the first place, also send a 401 Unauthorized
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// This is another middleware function called 'authorize'.
// Its job is to make sure the authenticated user has the *correct role(s)* to access a route.
// It takes a list of roles that are allowed (e.g., authorize('admin', 'house_owner')).
const authorize = (...roles) => {
  return (req, res, next) => {
    // We check if the user's role (from req.user, set by 'protect' middleware)
    // is included in the list of 'allowedRoles' for this route.
    if (!roles.includes(req.user.role)) {
      // If the user's role is not allowed, send a 403 Forbidden response.
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next(); // If the role is allowed, move on to the next function
  };
};

// We export these two middleware functions so our Express routes can use them.
module.exports = { protect, authorize };