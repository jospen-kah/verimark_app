const Attendance = require('../models/Attendance');
const AttendanceLog = require('../models/AttendanceLog');
const { getElevation } = require('../utils/elevation'); // or '../services/elevation.service'
const { isInsidePolygonWithAltitude } = require('../services/geo.service');
const Hall = require('../models/Hall');
const User = require('../models/User');
const mongoose = require('mongoose');
const Course = require('../models/Course');

// Initiate attendance session
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
    res.status(201).json({ message: 'Attendance initiated successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check-in controller
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude, attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ message: 'Attendance session ID is required' });
    }

    const session = await Attendance.findOne({ _id: attendanceId, status: 'open' })
      .populate('hallId');

    if (!session) {
      return res.status(404).json({ message: 'No active session found for this ID' });
    }

    const hall = session.hallId;

    // Get altitude from external API
    const altitude = await getElevation(latitude, longitude);
    console.log(`Altitude for coordinates (${latitude}, ${longitude}): ${altitude}`); 

    // Validate geofence including altitude
    const isInside = isInsidePolygonWithAltitude(
      { latitude, longitude, altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    if (!isInside) {
      return res.status(403).json({ message: 'You are not in the hall geofence' });
    }

    // Create check-in log
    const log = new AttendanceLog({
      attendanceId: session._id,
      studentId: req.user._id,
      checkInTime: new Date()
    });

    await log.save();

    res.status(200).json({ message: 'Check-in logged successfully', log });

  } catch (err) {
    console.error('Check-in error:', err.message);
    res.status(500).json({ message: err.message });
  }
};


// Check-out controller
exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const session = await Attendance.findOne({ status: 'open' })
      .sort({ startTime: -1 })
      .populate('hallId');

    if (!session) return res.status(404).json({ message: 'No active session' });

    const hall = session.hallId;
    const altitude = await getElevation(latitude, longitude);

    const isInside = isInsidePolygonWithAltitude(
      { latitude, longitude, altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    if (!isInside) {
      return res.status(403).json({ message: 'You are not in the hall geofence' });
    }

    // Find the most recent check-in without a checkout for this student/session
    const lastLog = await AttendanceLog.findOne({
      attendanceId: session._id,
      studentId: req.user._id,
      checkOutTime: { $exists: false }
    }).sort({ checkInTime: -1 });

    if (!lastLog) {
      return res.status(400).json({ message: 'No check-in record found to check out from' });
    }

    lastLog.checkOutTime = new Date();
    await lastLog.save();

    res.status(200).json({ message: 'Check-out logged successfully', log: lastLog });
  } catch (err) {
    console.error('Check-out error:', err.message);
    res.status(500).json({ message: err.message });
  }
};



exports.getAttendanceSessionSummary = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const summary = await AttendanceLog.aggregate([
      {
        $match: {
          attendanceId: new mongoose.Types.ObjectId(attendanceId)
        }
      },
      {
        $group: {
          _id: '$studentId',
          totalTimeMs: {
            $sum: {
              $subtract: [
                { $ifNull: ['$checkOutTime', new Date()] },
                '$checkInTime'
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $match: { 'studentInfo.role': 'student' }
      },
      {
        $project: {
          studentId: '$_id',
          firstName: '$studentInfo.firstName',
          lastName: '$studentInfo.lastName',
          matriNumber: '$studentInfo.matriNumber',
          totalMinutes: { $floor: { $divide: ['$totalTimeMs', 60000] } },
          attendanceStatus: {
            $cond: [
              { $gte: [{ $divide: ['$totalTimeMs', 60000] }, 60] },
              'present',
              'absent'
            ]
          }
        }
      }
    ]);

    res.status(200).json(summary);
  } catch (err) {
    console.error('Attendance session summary error:', err.message);
    res.status(500).json({ message: err.message });
  }
};




exports.getAttendanceSummary = async (req, res) => {
  try {
    const { attendanceId, studentId } = req.params;

    const logs = await AttendanceLog.find({
      attendanceId: new mongoose.Types.ObjectId(attendanceId),
      studentId: new mongoose.Types.ObjectId(studentId)
    });

    const totalMs = logs.reduce((acc, log) => {
      const end = log.checkOutTime || new Date();
      return acc + (end - log.checkInTime);
    }, 0);

    const totalMinutes = Math.floor(totalMs / 60000);
    const attendanceStatus = totalMinutes >= 60 ? 'present' : 'absent';

    const student = await User.findById(studentId).select('firstName lastName matriNumber');

    res.status(200).json({
      attendanceId,
      studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      matriNumber: student.matriNumber,
      totalMinutes,
      attendanceStatus
    });
  } catch (err) {
    console.error('Attendance summary error:', err.message);
    res.status(500).json({ message: err.message });
  }
};





exports.getOpenAttendances = async (req, res) => {
  try {
    const sessions = await Attendance.find({ status: 'open' })
      .populate('courseId', 'code name')     // Only get code and name
      .populate('hallId', 'name');           // Only get hall name

    const formatted = sessions.map(session => ({
      attendanceId: session._id,
      courseCode: session.courseId.code,
      courseName: session.courseId.name,
      hallName: session.hallId.name,
      startTime: session.startTime
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching open attendances:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};




