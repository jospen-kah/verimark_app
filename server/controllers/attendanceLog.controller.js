const AttendanceLog = require('../models/AttendanceLog');
const User = require('../models/User'); // Changed from Student to User
const Attendance = require('../models/Attendance');

// Get attendance log for a specific attendance session
exports.getAttendanceLog = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    // Validate attendanceId
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID is required'
      });
    }

    // Check if attendance session exists
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found'
      });
    }

    // Get attendance logs with populated student data
    const attendanceLogs = await AttendanceLog.find({ attendanceId })
      .populate({
        path: 'studentId',
        select: 'firstName lastName matriNumber email', // Using matriNumber from your schema
        model: 'User' // Changed from 'Student' to 'User'
      })
      .sort({ checkInTime: -1 });

    // Format the response data
    const formattedLogs = attendanceLogs.map(log => {
      const student = log.studentId;
      
      // Calculate total minutes if student has checked out
      let totalMinutes = null;
      if (log.checkInTime && log.checkOutTime) {
        const checkIn = new Date(log.checkInTime);
        const checkOut = new Date(log.checkOutTime);
        totalMinutes = Math.floor((checkOut - checkIn) / (1000 * 60));
      }

      // Determine attendance status
      let attendanceStatus = 'absent';
      if (log.checkInTime) {
        attendanceStatus = log.checkOutTime ? 'present' : 'partial';
      }

      // Format check-in time
      const checkInTime = log.checkInTime 
        ? new Date(log.checkInTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : null;

      return {
        id: log._id.toString(),
        name: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        matriNumber: student ? student.matriNumber : 'N/A', // Using matriNumber from your schema
        email: student ? student.email : null,
        checkInTime: checkInTime,
        checkOutTime: log.checkOutTime 
          ? new Date(log.checkOutTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          : null,
        totalMinutes: totalMinutes,
        attendanceStatus: attendanceStatus,
        isCurrentlyCheckedIn: log.checkInTime && !log.checkOutTime
      };
    });

    // Get summary statistics
    const checkedInCount = attendanceLogs.filter(log => log.checkInTime).length;
    const currentlyCheckedIn = attendanceLogs.filter(log => log.checkInTime && !log.checkOutTime).length;
    const completedAttendance = attendanceLogs.filter(log => log.checkInTime && log.checkOutTime).length;

    res.status(200).json({
      success: true,
      data: {
        attendanceId: attendanceId,
        sessionInfo: {
          courseId: attendance.courseId,
          hallId: attendance.hallId,
          startTime: attendance.startTime,
          endTime: attendance.endTime,
          status: attendance.status,
          date: attendance.date
        },
        statistics: {
          totalCheckedIn: checkedInCount,
          currentlyCheckedIn: currentlyCheckedIn,
          completedAttendance: completedAttendance
        },
        students: formattedLogs
      }
    });

  } catch (error) {
    console.error('Error fetching attendance log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance log',
      error: error.message
    });
  }
};

// Get real-time checked-in students (for active sessions)
exports.getCheckedInStudents = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    // Validate attendanceId
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID is required'
      });
    }

    // Get only currently checked-in students (no checkout time)
    const checkedInLogs = await AttendanceLog.find({ 
      attendanceId,
      checkInTime: { $exists: true },
      checkOutTime: { $exists: false }
    })
    .populate({
      path: 'studentId',
      select: 'firstName lastName matriNumber email', // Using matriNumber from your schema
      model: 'User' // Changed from 'Student' to 'User'
    })
    .sort({ checkInTime: -1 });

    // Format the response
    const students = checkedInLogs.map(log => {
      const student = log.studentId;
      
      return {
        id: log._id.toString(),
        name: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        matriNumber: student ? student.matriNumber : 'N/A', // Using matriNumber from your schema
        checkInTime: new Date(log.checkInTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        isCurrentlyCheckedIn: true,
        attendanceStatus: 'present'
      };
    });

    res.status(200).json({
      success: true,
      attendanceId: attendanceId,
      checkedInCount: students.length,
      students: students
    });

  } catch (error) {
    console.error('Error fetching checked-in students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch checked-in students',
      error: error.message
    });
  }
};

// Get attendance summary for instructor
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId)
      .populate('courseId', 'code title')
      .populate('hallId', 'name description');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found'
      });
    }

    const totalLogs = await AttendanceLog.countDocuments({ attendanceId });
    const checkedInLogs = await AttendanceLog.countDocuments({ 
      attendanceId, 
      checkInTime: { $exists: true } 
    });
    const completedLogs = await AttendanceLog.countDocuments({ 
      attendanceId, 
      checkInTime: { $exists: true },
      checkOutTime: { $exists: true }
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: attendance._id,
        course: attendance.courseId,
        hall: attendance.hallId,
        date: attendance.date,
        startTime: attendance.startTime,
        endTime: attendance.endTime,
        status: attendance.status,
        statistics: {
          totalStudents: totalLogs,
          checkedIn: checkedInLogs,
          completed: completedLogs,
          currentlyActive: checkedInLogs - completedLogs
        }
      }
    });

  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
};