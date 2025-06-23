const User = require('../models/User');

// Get all instructors waiting for approval
const getPendingInstructors = async (req, res) => {
  try {
    const pending = await User.find({ role: 'instructor', isApproved: false });
    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Approve instructor
const approveInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    instructor.isApproved = true;
    // instructor.isApprovedBy = req.user._id; // Uncomment when auth is enabled
    instructor.approvedDate = new Date();

    await instructor.save();
    
    res.status(200).json({
      success: true,
      message: 'Instructor approved successfully',
      data: instructor
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Reject instructor approval (delete from system)
const rejectInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Delete the instructor completely
    await instructor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Instructor rejected and removed from system'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get list of all approved instructors
const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor', isApproved: true });
    res.status(200).json({
      success: true,
      data: instructors
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = {
  getPendingInstructors,
  approveInstructor,
  rejectInstructor,
  getAllInstructors,
};