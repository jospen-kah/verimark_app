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
    // Check if user is an instructor
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can initiate attendance.' });
    }

    const { courseId, hallId, startTime, endTime } = req.body;

    if (!startTime) {
      return res.status(400).json({ message: 'startTime is required' });
    }
    if (!endTime) {
      return res.status(400).json({ message: 'endTime is required' });
    }

    const attendance = new Attendance({
      courseId,
      instructorId: req.user._id,
      hallId,
      startTime: new Date(startTime), // Use provided startTime
      endTime: new Date(endTime),     // Use provided endTime
      status: 'open'
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance initiated successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//verify it student is inside the hall geofence with altitude
exports.verifyGeofence = async (req, res) => {
  try {
    const { latitude, longitude, attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ message: 'Attendance session ID is required' });
    }

    const session = await Attendance.findOne({ _id: attendanceId, status: 'open' }).populate('hallId');
    if (!session) {
      return res.status(404).json({ message: 'No active attendance session found' });
    }

    const hall = session.hallId;

    // Get altitude from external API
    const altitude = await getElevation(latitude, longitude);

    // Check geofence with altitude
    const isInside = isInsidePolygonWithAltitude(
      { latitude, longitude, altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    return res.status(200).json({ inside: isInside });
  } catch (err) {
    console.error('Verify geofence error:', err);
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
    const { attendanceId, latitude, longitude } = req.body;

    // Find the specific attendance session
    const session = await Attendance.findOne({ _id: attendanceId, status: 'open' })
      .populate('hallId');

    if (!session) return res.status(404).json({ message: 'No active session found for the given attendanceId' });

    const hall = session.hallId;

    // Get current altitude from external service
    const altitude = await getElevation(latitude, longitude);

    // Check if user is inside the hall geofence (with altitude)
    const isInside = isInsidePolygonWithAltitude(
      { latitude, longitude, altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    if (!isInside) {
      return res.status(403).json({ message: 'You are not within the geofenced hall area' });
    }

    // Find the most recent check-in for this session without a checkout
    const lastLog = await AttendanceLog.findOne({
      attendanceId,
      studentId: req.user._id,
      checkOutTime: { $exists: false }
    }).sort({ checkInTime: -1 });

    if (!lastLog) {
      return res.status(400).json({ message: 'No open check-in record found to check out from' });
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
      .populate('courseId', 'code title')     // Only get code and name
      .populate('hallId', 'name');           // Only get hall name

    const formatted = sessions.map(session => ({
      attendanceId: session._id,
      courseCode: session.courseId.code,
      courseName: session.courseId.title,
      hallName: session.hallId.name,
      startTime: session.startTime,
      endTime: session.endTime,
    }));
    console.log('Sessions fetched:', JSON.stringify(sessions, null, 2));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching open attendances:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// End attendance session (instructor only)
exports.endSession = async (req, res) => {
  try {
    // Check if user is an instructor
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can end a session.' });
    }

    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ message: 'attendanceId is required.' });
    }

    // Find the attendance session
    const session = await Attendance.findById(attendanceId);

    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found.' });
    }

    // Only the instructor who started the session can end it
    if (session.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to end this session.' });
    }

    // Set status to closed and update endTime
    session.status = 'closed';
    session.endTime = new Date();
    await session.save();

    res.status(200).json({ message: 'Attendance session ended successfully.', session });
  } catch (err) {
    console.error('End session error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all attendances initiated by the logged-in instructor
exports.getInstructorAttendances = async (req, res) => {
  try {
    // Ensure only instructors can access their sessions
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can view their attendances.' });
    }

    const sessions = await Attendance.find({ instructorId: req.user._id })
      .populate('courseId', 'code title')
      .populate('hallId', 'name');

    const formatted = sessions.map(session => ({
      attendanceId: session._id,
      courseCode: session.courseId.code,
      courseName: session.courseId.title,
      hallName: session.hallId.name,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching instructor attendances:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};




