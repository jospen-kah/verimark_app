const express = require('express');
const router = express.Router();
const {
  createCourse,
  updateCourse,
  getCourse
} = require('../controllers/course.controller');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Create a course (admin or instructor)
router.post('/create', protect, restrictTo('admin'), createCourse);

// Edit a course
router.put('/:id/edit', protect, restrictTo('admin'), updateCourse);

// Get course details
router.get('/:id', protect, getCourse);

module.exports = router;
