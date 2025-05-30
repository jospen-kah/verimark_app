const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.post(
  '/initiate',
  protect,
  restrictTo('instructor'),  // <-- corrected function name here
  attendanceController.initiateAttendance
);

router.post('/check-in', 
  protect, 
  restrictTo('student'), 
  attendanceController.checkIn);

router.get('/attendance/summary/:attendanceId/:studentId',
  protect, 
  restrictTo('instructor, admin'), 
  attendanceController.getAttendanceSummary);

router.get('/session-summary/:attendanceId',
   protect, 
   restrictTo("admin, instructor"), 
   attendanceController.getAttendanceSessionSummary);

router.get('/open-sessions', 
  protect,
  restrictTo('student'),
   attendanceController.getOpenAttendances);



module.exports = router;
