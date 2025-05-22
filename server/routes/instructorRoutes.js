const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getPendingInstructors,
  approveInstructor,
  getAllInstructors
} = require('../controllers/instructorController');

const router = express.Router();

// Superadmin-only routes
router.get('/pending', protect, restrictTo('superadmin'), getPendingInstructors);
router.patch('/approve/:id', protect, restrictTo('superadmin'), approveInstructor);

// Optional: Public or protected route to get all approved instructors
router.get('/approved', protect, restrictTo('superadmin', 'admin'), getAllInstructors);

module.exports = router;
