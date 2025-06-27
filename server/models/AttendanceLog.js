const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const attendanceLogSchema = new Schema({
  attendanceId: { type: Types.ObjectId, ref: 'Attendance', required: true },
  studentId: { type: Types.ObjectId, ref: 'User', required: true }, // Changed from 'Student' to 'User'
  checkInTime: Date,
  checkOutTime: Date
}, {
  timestamps: true // Optional: adds createdAt and updatedAt fields
});

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);