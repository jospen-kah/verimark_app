const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const attendanceLogSchema = new Schema({
  attendanceId: { type: Types.ObjectId, ref: 'Attendance', required: true },
  studentId: { type: Types.ObjectId, ref: 'Student', required: true },
  checkInTime: Date,
  checkOutTime: Date
});

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
