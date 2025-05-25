const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const coordinateSchema = new Schema({
  latitude: Number,
  longitude: Number,
  altitude: Number,
});

const hallSchema = new Schema({
  name: { type: String, required: true },
  coordinates: [coordinateSchema],  // Array of polygon points with altitude
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hall', hallSchema);
