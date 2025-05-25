const Attendance = require('../models/Attendance');
const AttendanceLog = require('../models/AttendanceLog');
const { isInsidePolygonWithAltitude } = require('../services/geo.service');
const Hall = require('../models/Hall');

exports.initiateAttendance = async (req, res) => {
  try {
    const { courseId, hallId } = req.body;

    const attendance = new Attendance({
      courseId,
      instructorId: req.user._id,
      hallId,
      startTime: new Date(),
      status: 'open'
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance initiated', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude, altitude } = req.body;

    const session = await Attendance.findOne({ status: 'open' })
      .sort({ startTime: -1 })
      .populate('hallId');

    if (!session) return res.status(404).json({ message: 'No active attendance session' });

    const inside = isInsidePolygonWithAltitude({ latitude, longitude, altitude }, session.hallId.coordinates);
    if (!inside) return res.status(403).json({ message: 'You are not inside the hall geofence' });

    const existing = await AttendanceLog.findOne({ studentId: req.user._id, attendanceId: session._id });
    if (existing) return res.status(400).json({ message: 'Already checked in' });

    const log = await AttendanceLog.create({
      studentId: req.user._id,
      attendanceId: session._id,
      checkInTime: new Date()
    });

    res.status(200).json({ message: 'Check-in successful', log });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
