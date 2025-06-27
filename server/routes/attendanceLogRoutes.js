const express = require('express');
const router = express.Router();
const attendanceLogController = require('../controllers/attendanceLog.controller');



// Get complete attendance log for a session
router.get('/log/:attendanceId', 
     attendanceLogController.getAttendanceLog);

// Get currently checked-in students (for real-time updates)
router.get('/checked-in/:attendanceId', 
     attendanceLogController.getCheckedInStudents);

// Get attendance summary/statistics
router.get('/summary/:attendanceId', 
     attendanceLogController.getAttendanceSummary);

module.exports = router;