const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middlewares/authMiddleware');



// Routes
router.get('/courses',
    reportController.getCourses);

router.get('/attendance/:courseId', 
    reportController.getAttendanceReport);

router.get('/students/:courseId', 
    reportController.getStudentReport);

module.exports = router;