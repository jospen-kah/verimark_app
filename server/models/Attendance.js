const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  courseId: { type: ObjectId, ref: 'Course' },
  instructorId: { type: ObjectId, ref: 'Instructor' },
  hallId: { type: ObjectId, ref: 'Hall' }, // Selected hall for session
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdAt: Date
});

module.exports = mongoose.model('Attendance', attendanceSchema);
