const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect, restrictTo } = require('../middlewares/authMiddleware'); // <-- use restrictTo here

router.post(
  '/initiate',
  protect,
  restrictTo('instructor'),  // <-- corrected function name here
  attendanceController.initiateAttendance
);

router.post(
  '/check-in',
  protect,
  restrictTo('student'), // <-- corrected function name here
  attendanceController.checkIn
);

module.exports = router;
