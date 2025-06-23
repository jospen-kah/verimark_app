const express = require('express');
const router = express.Router();
const {
  getPendingInstructors,
  approveInstructor,
  getAllInstructors,
  rejectInstructor
} = require('../controllers/instructorController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Get pending instructors waiting for approval
router.get('/pending', 
  // protect,
  // restrictTo('admin'), 
  getPendingInstructors);

// Approve an instructor
router.patch('/approve/:id',
  // protect, 
  // restrictTo('admin'), 
  approveInstructor);

// Reject/Delete an instructor   
router.delete('/reject/:id',
  // protect,
  // restrictTo('admin'),
  rejectInstructor);

// Get all approved instructors
router.get('/', 
  // protect,
  // restrictTo('admin'),
  getAllInstructors);

module.exports = router;