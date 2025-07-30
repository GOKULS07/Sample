const Room = require('../models/Room'); // Pull in our Room blueprint (Mongoose model)
const path = require('path'); // Node.js tool for working with file paths
const fs = require('fs'); // Node.js tool for file system operations (like deleting files)

// This function creates a brand new room listing.
// It's called when a house owner sends a POST request to /api/rooms.
const createRoom = async (req, res) => {
  // Grab all the room details from what the owner sent in the form
  const { name, floorSize, numberOfBeds, amenities, dailyRentAmount, minBookingDays, maxBookingDays, description, isAvailable } = req.body;

  // Let's get the amenities ready: they come as a comma-separated string from the frontend
  let parsedAmenities = [];
  if (amenities) { // Check if 'amenities' was even provided
    if (Array.isArray(amenities)) {
      // If by chance it's already an array, use it directly
      parsedAmenities = amenities;
    } else if (typeof amenities === 'string') {
      // Otherwise, split the comma-separated string, clean up spaces, and remove any empty bits
      parsedAmenities = amenities.split(',').map(item => item.trim()).filter(Boolean);
    }
  }

  // Handle the uploaded image file. Multer (our file-uploading tool) puts the file info in 'req.file'.
  let photoUrl = '';
  if (req.file) {
    // We build the URL where this image can be accessed by browsers (e.g., http://localhost:5000/uploads/myroom.jpg)
    photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  } else {
    // If no picture was uploaded, that's a problem for a new room listing
    return res.status(400).json({ message: 'Room image is required.' });
  }

  try {
    // Go ahead and create the new room in our database
    const room = await Room.create({
      owner: req.user.id, // The owner's ID comes from the authenticated user (from the JWT token)
      name,
      floorSize: Number(floorSize), // Convert these from strings (from form) to actual numbers
      numberOfBeds: Number(numberOfBeds),
      amenities: parsedAmenities, // Use our nicely parsed amenities array
      dailyRentAmount: Number(dailyRentAmount),
      minBookingDays: Number(minBookingDays),
      maxBookingDays: Number(maxBookingDays),
      photos: [photoUrl], // Store the URL of the uploaded image
      description,
      isAvailable: isAvailable === 'true', // Convert the 'true'/'false' string from the checkbox to a real boolean
    });

    // Send back a success message with the newly created room's data
    res.status(201).json({ success: true, data: room });

  } catch (error) {
    console.error("Problem creating room:", error); // Log the actual error for debugging
    // If it's a Mongoose validation error (e.g., missing required field, wrong type), send a more specific message
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message }); // Generic server error for other issues
  }
};

// This function updates details of an existing room listing.
// It's called when a house owner sends a PUT request to /api/rooms/:id.
const updateRoom = async (req, res) => {
  try {
    // First, find the room by its ID from the URL
    let room = await Room.findById(req.params.id);
    if (!room) {
      // If the room isn't found, let the client know
      return res.status(404).json({ message: 'Room not found' });
    }

    // Security check: Make sure the logged-in user is actually the owner of this room
    if (room.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'You\'re not allowed to update this room.' });
    }

    // Grab the updated room details from what the owner sent
    const { name, floorSize, numberOfBeds, amenities, dailyRentAmount, minBookingDays, maxBookingDays, description, isAvailable } = req.body;
    
    // Update the room's fields, using new values if provided, otherwise keep old ones
    room.name = name || room.name;
    room.floorSize = Number(floorSize) || room.floorSize;
    room.numberOfBeds = Number(numberOfBeds) || room.numberOfBeds;
    
    // Process amenities for update: Convert to array if it comes as a string
    let parsedAmenities = room.amenities; // Start with current amenities
    if (amenities) {
        if (Array.isArray(amenities)) {
            parsedAmenities = amenities;
        } else if (typeof amenities === 'string') {
            parsedAmenities = amenities.split(',').map(item => item.trim()).filter(Boolean);
        }
    }
    room.amenities = parsedAmenities;

    room.dailyRentAmount = Number(dailyRentAmount) || room.dailyRentAmount;
    room.minBookingDays = Number(minBookingDays) || room.minBookingDays;
    room.maxBookingDays = Number(maxBookingDays) || room.maxBookingDays;
    room.description = description || room.description;
    room.isAvailable = isAvailable === 'true' || isAvailable === true; // Handle boolean conversion

    // Handle new photo upload: If a new file was sent, Multer put it in req.file
    if (req.file) {
        // Build the URL for the new image
        const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        // Optional: Delete the old image file from our server's 'uploads' folder
        if (room.photos && room.photos.length > 0) {
            const oldFilename = path.basename(room.photos[0]);
            const oldFilePath = path.join(__dirname, '../uploads', oldFilename);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.warn("Problem deleting old file:", err); // Log warning but don't stop process
                else console.log("Old file deleted:", oldFilePath);
            });
        }
        room.photos = [photoUrl]; // Replace existing photos with the new one
    } else {
        // If no new file, but the frontend sent the 'photos' field (meaning it has current photos as a string)
        if (req.body.photos && typeof req.body.photos === 'string' && req.body.photos !== '') {
            try {
                // Parse the JSON string of old photo URLs back into an array
                room.photos = JSON.parse(req.body.photos);
            } catch (parseError) {
                console.warn("Problem parsing existing photos string from frontend:", req.body.photos, parseError);
                room.photos = []; // If parsing fails, just clear photos
            }
        } else if (!req.body.photos && room.photos.length > 0) {
            // If photos field wasn't sent or was empty, but room had old photos, clear them.
            room.photos = [];
        }
    }

    // Save the updated room document to the database
    const updatedRoom = await room.save();

    // Send back a success response with the updated room data
    res.status(200).json({ success: true, data: updatedRoom });

  } catch (error) {
    console.error("Problem updating room:", error);
    // Handle Mongoose validation or casting errors specifically
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid room ID format or data type.' });
    }
    res.status(500).json({ message: error.message }); // Generic server error
  }
};

// This function deletes a room listing.
// It's called when a house owner sends a DELETE request to /api/rooms/:id.
const deleteRoom = async (req, res) => {
  try {
    // Find the room to be deleted by its ID
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Security check: Make sure the logged-in user is the owner of this room
    if (room.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'You\'re not allowed to delete this room.' });
    }

    // Optional: Delete the image file from our server's 'uploads' directory
    if (room.photos && room.photos.length > 0) {
        // Extract filename from the image URL
        const filename = path.basename(room.photos[0]);
        const filePath = path.join(__dirname, '../uploads', filename); // Build the full file path
        
        // Use fs.unlink to delete the file. Log any errors but continue.
        const fs = require('fs'); // Re-import fs just in case (good practice for clarity here)
        fs.unlink(filePath, (err) => {
            if (err) console.error("Problem deleting old image file:", err);
            else console.log("Old image file deleted:", filePath);
        });
    }

    await room.deleteOne(); // Delete the room document from MongoDB

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error("Problem deleting room:", error);
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid room ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// This function gets all room listings.
// It's called by a GET request to /api/rooms (publicly accessible).
const getRooms = async (req, res) => {
  try {
    // Find all rooms and also get some owner info (email, mobile) for each room
    const rooms = await Room.find().populate('owner', 'email mobileNumber');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    console.error("Problem fetching rooms:", error);
    res.status(500).json({ message: error.message });
  }
};

// This function gets details for a single room by its ID.
// It's called by a GET request to /api/rooms/:id (publicly accessible).
const getRoomById = async (req, res) => {
  try {
    // Find a room by ID and populate owner details
    const room = await Room.findById(req.params.id).populate('owner', 'email mobileNumber');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    console.error("Problem fetching room by ID:", error);
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid room ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// This function gets all rooms belonging to the currently logged-in owner.
// It's called by a GET request to /api/rooms/owner-rooms/me (protected route, only for owners).
const getOwnerRooms = async (req, res) => {
  try {
    // Find rooms where the 'owner' field matches the ID from the authenticated user
    const rooms = await Room.find({ owner: req.user.id }).populate('owner', 'email mobileNumber');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    console.error("Problem fetching owner's rooms:", error);
    res.status(500).json({ message: error.message });
  }
};

// Export all these functions so they can be used by our Express routes
module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms
};