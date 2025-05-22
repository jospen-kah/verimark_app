const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed

  role: {
    type: String,
    enum: ['admin', 'instructor', 'student'],
    required: true
  },

  // Instructor-specific
  isApproved: { type: Boolean, default: false },
  isApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who approved
  approvedDate: { type: Date },

  // Student-specific
  matriNumber: { type: String, unique: true, sparse: true }, // Optional, but required for students
  faceData: { type: [Number], default: [] }, // e.g., Face embedding
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // For password reset with 4-digit code
  resetCode: String,
  resetCodeExpires: Date,

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
