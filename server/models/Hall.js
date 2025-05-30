const mongoose = require('mongoose');
const { Schema } = mongoose;

const hallSchema = new Schema({
  name: { type: String, required: true },
  coordinates: [
    {
      latitude: Number,
      longitude: Number
    }
  ],
  minAltitude: { type: Number, required: true }, // e.g., ground floor = 400
  maxAltitude: { type: Number, required: true }, // e.g., first floor = 404
});

module.exports = mongoose.model('Hall', hallSchema);
