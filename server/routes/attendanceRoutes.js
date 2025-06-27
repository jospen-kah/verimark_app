const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); 

router.post('/verify-geofence',protect,restrictTo('student'), attendanceController.verifyGeofence);

router.post(
  '/initiate',
  protect,
  restrictTo('instructor'),  // <-- corrected function name here
  attendanceController.initiateAttendance
);

router.post(
  '/end-session',
  protect,
  restrictTo('instructor'),  
  attendanceController.endSession
);


router.post('/check-in',
  protect,
  restrictTo('student'), 
  upload.single('faceImage'), 
  attendanceController.checkIn);






router.get('/summary/:attendanceId/:studentId',
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

router.get(
  '/instructor-sessions',
  protect,
  restrictTo('instructor'),
  attendanceController.getInstructorAttendances
);

router.get('/session/:attendanceId', 
  attendanceController.getAttendanceSession);


module.exports = router;
