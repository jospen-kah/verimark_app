const express = require('express');
const router = express.Router();
const {
  getPendingInstructors,
  approveInstructor,
  getAllInstructors
} = require('../controllers/instructorController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.get('/pending', protect, restrictTo('admin'), getPendingInstructors);
router.patch('/approve/:id', protect, restrictTo('admin'), approveInstructor);
router.get('/', getAllInstructors);

module.exports = router;
