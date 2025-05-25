const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const attendanceSchema = new Schema({
  courseId: { type: Types.ObjectId, ref: 'Course', required: true },
  instructorId: { type: Types.ObjectId, ref: 'Instructor', required: true },
  hallId: { type: Types.ObjectId, ref: 'Hall', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
