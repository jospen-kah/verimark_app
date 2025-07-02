const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const courseSchema = new Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  instructorId: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
