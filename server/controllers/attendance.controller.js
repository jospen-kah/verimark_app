const Attendance = require('../models/Attendance');
const AttendanceLog = require('../models/AttendanceLog');
const { getElevation } = require('../utils/elevation'); // or '../services/elevation.service'
const { isInsidePolygonWithAltitude } = require('../services/geo.service');
const Hall = require('../models/Hall');
const User = require('../models/User');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { compareFace } = require('../services/face.service');


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



const FaceData = require('../models/FaceData'); // Make sure to import your FaceData model

exports.checkIn = async (req, res) => {
  try {
    console.log('=== CHECK-IN CONTROLLER START ===');
    console.log('Request timestamp:', new Date().toISOString());
    
    const { latitude, longitude, attendanceId } = req.body;
    
    // Debug logging
    console.log('Request body:', req.body);
    console.log('User ID:', req.user?._id);
    console.log('File received:', !!req.file);
    
    // Validate required fields
    if (!attendanceId) {
      console.log('❌ Missing attendanceId');
      return res.status(400).json({ 
        success: false,
        message: 'Attendance session ID is required' 
      });
    }

    if (!latitude || !longitude) {
      console.log('❌ Missing coordinates');
      return res.status(400).json({ 
        success: false,
        message: 'Location coordinates are required' 
      });
    }

    // Check if face image is uploaded
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        message: 'Face image is required for check-in' 
      });
    }

    // Detailed file debugging
    console.log('=== FILE DEBUG INFO ===');
    console.log('File fieldname:', req.file.fieldname);
    console.log('File originalname:', req.file.originalname);
    console.log('File mimetype:', req.file.mimetype);
    console.log('File size:', req.file.size);
    console.log('File buffer exists:', !!req.file.buffer);
    console.log('File buffer length:', req.file.buffer?.length);
    console.log('File path exists:', !!req.file.path);
    console.log('=== END FILE DEBUG ===');

    // Find attendance session
    const session = await Attendance.findOne({ _id: attendanceId, status: 'open' })
      .populate('hallId');

    if (!session) {
      console.log('❌ No active session found');
      return res.status(404).json({ 
        success: false,
        message: 'No active session found for this ID' 
      });
    }

    console.log('✅ Attendance session found:', session._id);
    const hall = session.hallId;

    // Get altitude from external API
    console.log('Getting elevation for coordinates:', { latitude, longitude });
    const altitude = await getElevation(latitude, longitude);
    console.log(`Altitude for coordinates (${latitude}, ${longitude}): ${altitude}`);

    // Validate geofence including altitude
    console.log('Validating geofence...');
    const isInside = isInsidePolygonWithAltitude(
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude), altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    console.log(`Point ${latitude}, ${longitude} with altitude ${altitude} is inside polygon:`, isInside);

    if (!isInside) {
      console.log('❌ Not inside geofence');
      return res.status(403).json({ 
        success: false,
        message: 'You are not in the hall geofence' 
      });
    }

    console.log('✅ Geofence validation passed');

    // Check if student already checked in for this session
    const existingLog = await AttendanceLog.findOne({
      attendanceId: session._id,
      studentId: req.user._id
    });

    if (existingLog) {
      console.log('❌ User already checked in');
      return res.status(400).json({ 
        success: false,
        message: 'You have already checked in for this session' 
      });
    }

    console.log('✅ No existing check-in found');

    // Retrieve face data from FaceData collection
    console.log('Retrieving face data for student:', req.user._id);
    const faceDataDoc = await FaceData.findOne({ studentId: req.user._id });
    
    if (!faceDataDoc) {
      console.log('❌ No face data document found');
      return res.status(400).json({ 
        success: false,
        message: 'No face data registered for this user. Please register your face first.' 
      });
    }

    // Debug the retrieved face data
    console.log('=== FACE DATA DEBUG INFO ===');
    console.log('Face data document found:', !!faceDataDoc);
    console.log('Face data array exists:', !!faceDataDoc.faceData);
    console.log('Face data type:', typeof faceDataDoc.faceData);
    console.log('Face data is array:', Array.isArray(faceDataDoc.faceData));
    console.log('Face data length:', faceDataDoc.faceData?.length);
    console.log('Face data sample (first 5):', faceDataDoc.faceData?.slice(0, 5));
    console.log('Has NaN values:', faceDataDoc.faceData?.some(val => isNaN(val)));
    console.log('All are numbers:', faceDataDoc.faceData?.every(val => typeof val === 'number'));
    console.log('=== END FACE DATA DEBUG ===');

    // Validate face data
    if (!faceDataDoc.faceData || !Array.isArray(faceDataDoc.faceData) || faceDataDoc.faceData.length === 0) {
      console.log('❌ Invalid face data format');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid face data format. Please re-register your face.' 
      });
    }

    console.log('✅ Face data validation passed');

    // Get image buffer (handle both memory and disk storage)
    let imageBuffer;
    
    if (req.file.buffer) {
      // Memory storage
      console.log('Using memory storage buffer');
      imageBuffer = req.file.buffer;
    } else if (req.file.path) {
      // Disk storage - read file
      console.log('Reading file from disk storage:', req.file.path);
      const fs = require('fs');
      try {
        imageBuffer = fs.readFileSync(req.file.path);
        console.log('✅ File read from disk, buffer length:', imageBuffer.length);
        
        // Clean up file after reading
        fs.unlinkSync(req.file.path);
        console.log('✅ Temporary file cleaned up');
      } catch (fileError) {
        console.error('❌ Error reading file from disk:', fileError);
        return res.status(500).json({ 
          success: false,
          message: 'Error processing uploaded image' 
        });
      }
    } else {
      console.log('❌ No buffer or path available');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid face image data - no buffer or file path available' 
      });
    }

    // Validate image buffer
    if (!imageBuffer || imageBuffer.length === 0) {
      console.log('❌ Empty image buffer');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or empty face image data' 
      });
    }

    console.log('✅ Image buffer ready, length:', imageBuffer.length);

    // Perform face verification
    try {
      console.log('=== FACE VERIFICATION START ===');
      console.log('Calling compareFace function...');
      console.log('Image buffer length:', imageBuffer.length);
      console.log('Stored face data length:', faceDataDoc.faceData.length);
      
      // Pass the actual faceData array from the FaceData document
      const faceMatch = await compareFace(imageBuffer, faceDataDoc.faceData);
      console.log('Face verification result:', faceMatch);
      console.log('=== FACE VERIFICATION END ===');
      
      // Check if faceMatch is a boolean or an object with match property
      let isMatch;
      if (typeof faceMatch === 'boolean') {
        isMatch = faceMatch;
      } else if (faceMatch && typeof faceMatch === 'object' && 'match' in faceMatch) {
        isMatch = faceMatch.match;
      } else {
        throw new Error('Invalid face verification result format');
      }
      
      if (!isMatch) {
        console.log('❌ Face verification failed');
        return res.status(403).json({ 
          success: false,
          message: 'Face verification failed. Access denied.',
          faceResult: faceMatch // Include details for debugging
        });
      }
      
      console.log('✅ Face verification successful');
      
    } catch (faceError) {
      console.error('❌ Face verification error:', faceError);
      console.error('Face error stack:', faceError.stack);
      
      // Additional debugging for face errors
      console.log('=== FACE ERROR DEBUG ===');
      console.log('Error message:', faceError.message);
      console.log('Error name:', faceError.name);
      console.log('Image buffer valid:', !!imageBuffer && imageBuffer.length > 0);
      console.log('Face data valid:', !!faceDataDoc.faceData && Array.isArray(faceDataDoc.faceData));
      console.log('=== END FACE ERROR DEBUG ===');
      
      return res.status(500).json({ 
        success: false,
        message: 'Face verification failed due to technical error',
        error: process.env.NODE_ENV === 'development' ? faceError.message : 'Face verification error'
      });
    }

    // Create check-in log
    console.log('Creating attendance log...');
    const log = new AttendanceLog({
      attendanceId: session._id,
      studentId: req.user._id,
      checkInTime: new Date(),
      faceVerified: true,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        altitude: altitude
      }
    });

    await log.save();
    console.log('✅ Attendance log saved:', log._id);

    console.log('=== CHECK-IN SUCCESSFUL ===');
    
    res.status(200).json({ 
      success: true,
      message: 'Check-in logged successfully with face verification', 
      log: {
        id: log._id,
        checkInTime: log.checkInTime,
        faceVerified: log.faceVerified,
        location: log.location
      }
    });

  } catch (err) {
    console.error('❌ CHECK-IN CONTROLLER ERROR:', err);
    console.error('Error stack:', err.stack);
    
    // Clean up uploaded file in case of error (disk storage)
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('✅ Cleaned up temporary file after error');
      } catch (cleanupError) {
        console.error('❌ File cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during check-in',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
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

exports.getAttendanceSession = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    // Validate attendanceId
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID is required'
      });
    }

    // Find the attendance session by ID and populate related data
    const session = await Attendance.findById(attendanceId)
      .populate({
        path: 'courseId',
        select: 'courseCode courseName',
        model: Course
      })
      .populate({
        path: 'hallId',
        select: 'hallName',
        model: Hall
      })
      .select('startTime endTime status createdAt');

    // Check if session exists
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found'
      });
    }

    // Debug logging - remove in production
    console.log('Session data:', {
      id: session._id,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      currentTime: new Date()
    });

    // Check if session is still active
    const currentTime = new Date();
    // Handle both string and Date types for endTime
    const sessionEndTime = session.endTime instanceof Date 
      ? session.endTime 
      : new Date(session.endTime);
    
    // More detailed validation with better error messages
    if (session.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This attendance session is closed',
        debug: {
          status: session.status,
          currentTime: currentTime.toISOString(),
          endTime: sessionEndTime.toISOString()
        }
      });
    }

    if (currentTime > sessionEndTime) {
      return res.status(400).json({
        success: false,
        message: 'This attendance session has ended',
        debug: {
          currentTime: currentTime.toISOString(),
          endTime: sessionEndTime.toISOString(),
          timeDifference: currentTime - sessionEndTime
        }
      });
    }

    // Format the response
    const sessionData = {
      attendanceId: session._id,
      courseCode: session.courseId?.courseCode || 'N/A',
      courseName: session.courseId?.courseName || 'Unknown Course',
      hallName: session.hallId?.hallName || 'Unknown Hall',
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      createdAt: session.createdAt,
      // Add time remaining for debugging
      timeRemaining: sessionEndTime ? Math.max(0, sessionEndTime - currentTime) : null
    };

    res.status(200).json({
      success: true,
      data: sessionData,
      message: 'Session details retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching attendance session:', error);
    
    // Handle different types of errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching session details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



