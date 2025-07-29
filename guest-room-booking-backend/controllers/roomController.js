const Room = require('../models/Room');
const path = require('path');

const createRoom = async (req, res) => {
  const { name, floorSize, numberOfBeds, amenities, dailyRentAmount, minBookingDays, maxBookingDays, description, isAvailable } = req.body;

  let parsedAmenities = [];
  if (amenities) {
    // Frontend sends amenities as a comma-separated string or an array-like string from FormData.
    // If it's a string, split it. If it's already an array, it's fine.
    if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    } else if (typeof amenities === 'string') {
      parsedAmenities = amenities.split(',').map(item => item.trim()).filter(Boolean);
    }
  }

  let photoUrl = '';
  if (req.file) {
    photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  } else {
    return res.status(400).json({ message: 'Room image is required.' });
  }

  try {
    const room = await Room.create({
      owner: req.user.id,
      name,
      floorSize: Number(floorSize),
      numberOfBeds: Number(numberOfBeds),
      amenities: parsedAmenities, // Use the correctly parsed amenities
      dailyRentAmount: Number(dailyRentAmount),
      minBookingDays: Number(minBookingDays),
      maxBookingDays: Number(maxBookingDays),
      photos: [photoUrl],
      description,
      isAvailable: isAvailable === 'true', // Convert string 'true'/'false' to boolean
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: error.message });
  }
};


const updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this room' });
    }

    const { name, floorSize, numberOfBeds, amenities, dailyRentAmount, minBookingDays, maxBookingDays, description, isAvailable } = req.body;
    
    room.name = name || room.name;
    room.floorSize = Number(floorSize) || room.floorSize;
    room.numberOfBeds = Number(numberOfBeds) || room.numberOfBeds;
    
    let parsedAmenities = [];
    if (amenities) {
        if (Array.isArray(amenities)) {
            parsedAmenities = amenities;
        } else if (typeof amenities === 'string') {
            // This case handles if amenities are sent as a comma-separated string
            parsedAmenities = amenities.split(',').map(item => item.trim()).filter(Boolean);
        }
    }
    room.amenities = parsedAmenities;

    room.dailyRentAmount = Number(dailyRentAmount) || room.dailyRentAmount;
    room.minBookingDays = Number(minBookingDays) || room.minBookingDays;
    room.maxBookingDays = Number(maxBookingDays) || room.maxBookingDays;
    room.description = description || room.description;
    room.isAvailable = isAvailable === 'true' || isAvailable === true;

    // Handle new photo upload
    if (req.file) {
        const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        room.photos = [photoUrl];
    } else {
        // Handle existing photos when no new file is uploaded
        // The frontend sends `photos` from `currentPhotos` as a JSON string when no new file is selected.
        if (req.body.photos && typeof req.body.photos === 'string' && req.body.photos !== '') {
            try {
                room.photos = JSON.parse(req.body.photos);
            } catch (parseError) {
                console.warn("Failed to parse existing photos string:", req.body.photos, parseError);
                room.photos = [];
            }
        } else {
            room.photos = []; // If no new photos and old photos string is empty or undefined
        }
    }

    const updatedRoom = await room.save();

    res.status(200).json({ success: true, data: updatedRoom });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this room' });
    }

    // Optional: Delete the file from the uploads directory when room is deleted
    if (room.photos && room.photos.length > 0) {
        const filename = path.basename(room.photos[0]);
        const filePath = path.join(__dirname, '../uploads', filename);
        const fs = require('fs');
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting old file:", err);
            else console.log("Old file deleted:", filePath);
        });
    }

    await room.deleteOne();

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('owner', 'email mobileNumber');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('owner', 'email mobileNumber');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    console.error("Error fetching room by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

const getOwnerRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user.id }).populate('owner', 'email mobileNumber');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    console.error("Error fetching owner's rooms:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms
};