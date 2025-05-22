const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: String, // e.g., "LT1", "Auditorium"
  description: String, // Optional
  latitude: Number,
  longitude: Number,
  altitude: Number,
  radius: Number, // Geofence radius in meters
  createdAt: Date
});

module.exports = mongoose.model('Hall', hallSchema);    
