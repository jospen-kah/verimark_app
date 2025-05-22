const User = require('../models/User');

// Get all instructors waiting for approval
const getPendingInstructors = async (req, res) => {
  try {
    const pending = await User.find({ role: 'instructor', isApproved: false });
    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve instructor (only by superadmin)
const approveInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    instructor.isApproved = true;
    instructor.isApprovedBy = req.user._id;
    instructor.approvedDate = new Date();

    await instructor.save();
    res.status(200).json({ message: 'Instructor approved', instructor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Optional: Get list of all approved instructors
const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor', isApproved: true });
    res.status(200).json(instructors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getPendingInstructors,
  approveInstructor,
  getAllInstructors,
};