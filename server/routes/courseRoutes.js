const express = require('express');
const router = express.Router();
const {
  createCourse,
  updateCourse,
  getCourse,
  getAllCourses,
  deleteCourse,
  getCoursesByInstructor
} = require('../controllers/course.controller');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Get all courses
router.get('/', 
  // protect,
  // restrictTo('admin'), 
  getAllCourses);

// Create a new course
router.post('/',
  // protect,
  // restrictTo('admin'),
  createCourse);

// Get single course
router.get('/:id',
  // protect,
  getCourse);

// Update course
router.put('/:id',
  // protect,
  // restrictTo('admin'),
  updateCourse);

// Delete course
router.delete('/:id',
  // protect,
  // restrictTo('admin'),
  deleteCourse);

router.get('/instructor/:instructorId',
  // protect,
  // restrictTo('admin', 'instructor'),
  getCoursesByInstructor);

module.exports = router;