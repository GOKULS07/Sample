const User = require('../models/User'); // Pull in our User model blueprint

// This function handles creating a new user (registration).
// It's called when someone sends a POST request to /api/auth/register.
const registerUser = async (req, res) => {
  // Grab the user's details from what they sent (email, password, mobile, role)
  const { email, password, mobileNumber, role } = req.body;

  try {
    // First, let's see if a user with this email already exists in our database
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If they do, send back an error because emails must be unique
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // If email is new, go ahead and create the new user in the database
    // Mongoose will automatically hash the password because of our 'pre-save' hook in the User model
    const user = await User.create({
      email,
      password,
      mobileNumber,
      role
    });

    // Once the user is created, generate a JWT (JSON Web Token) for them.
    // This token is like their login "ticket" for future requests.
    const token = user.getSignedJwtToken();

    // Send back a success response!
    res.status(201).json({ // 201 status means "Created"
      success: true, // Tells the frontend it worked
      token, // Send the token so the frontend can store it
      user: { // Send back some basic user info
        id: user._id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });

  } catch (error) {
    // If anything goes wrong (like a database error), send a generic server error
    res.status(500).json({ message: error.message });
  }
};

// This function handles user login.
// It's called when someone sends a POST request to /api/auth/login.
const loginUser = async (req, res) => {
  // Grab the email and password the user sent
  const { email, password } = req.body;

  try {
    // Try to find the user in the database by their email.
    // We also explicitly ask for the 'password' field (+password) for comparison.
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // If no user found with that email, it's an invalid credential attempt
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the password the user typed with the hashed password in the database
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // If passwords don't match, also an invalid credential attempt
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If credentials are correct, generate a new JWT for the user
    const token = user.getSignedJwtToken();

    // Send back a success response with the token and user info
    res.status(200).json({ // 200 status means "OK"
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });

  } catch (error) {
    // Catch any unexpected errors during the login process
    res.status(500).json({ message: error.message });
  }
};

// This function gets the profile of the currently logged-in user.
// It's called when a GET request is sent to /api/auth/me (a protected route).
const getMe = async (req, res) => {
  // The 'req.user.id' comes from our 'protect' middleware, meaning the user is authenticated.
  // We find the user by ID and specifically exclude the 'password' field from the result.
  const user = await User.findById(req.user.id).select('-password');
  // Send back the user's data
  res.status(200).json({ success: true, data: user });
};

// This function updates the profile of the currently logged-in user.
// It's called when a PUT request is sent to /api/auth/profile (a protected route).
const updateProfile = async (req, res) => {
  // Grab the fields that might be updated from the request body
  const { fullName, email, mobileNumber, password } = req.body;
  
  try {
    // Find the user to update by their ID (from the authenticated user)
    const user = await User.findById(req.user.id);

    if (!user) {
      // If for some reason the user isn't found (shouldn't happen if authenticated), send an error
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided in the request, otherwise keep old value
    user.email = email || user.email;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    
    // If a new password is provided, assign it. Our 'pre-save' hook will automatically hash it.
    if (password) {
      user.password = password; 
    }
    // Note: 'fullName' isn't currently in our User model, so it won't be saved unless added to the schema.

    // Save the updated user document to the database
    const updatedUser = await user.save();

    // Send back a success response with the updated user's basic info
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role
      }
    });

  } catch (error) {
    // Catch any unexpected errors during the update process
    res.status(500).json({ message: error.message });
  }
};

// Export all these functions so they can be used by our routes
module.exports = { registerUser, loginUser, getMe, updateProfile };