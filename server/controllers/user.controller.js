const User = require('../models/User');
const fs = require('fs');
const path = require('path');

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id; // or req.user._id if using auth middleware
    const user = await User.findById(userId).select('-password -resetCode -resetCodeExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
// Upload face profile image
exports.uploadFaceProfile = async (req, res) => {
  try {
    const userId = req.user._id; // make sure to authenticate user before
    const imagePath = `/uploads/faces/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { faceImageUrl: imagePath },
      { new: true }
    );

    res.status(200).json({
      message: 'Face profile uploaded successfully',
      faceImageUrl: user.faceImageUrl,
    });
  } catch (error) {
    console.error('Upload Face Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Edit/update face profile image
exports.updateFaceProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.faceImageUrl) {
      // Delete the old image file
      const oldImagePath = path.join(__dirname, '..', user.faceImageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const newImagePath = `/uploads/faces/${req.file.filename}`;

    user.faceImageUrl = newImagePath;
    await user.save();

    res.status(200).json({
      message: 'Face profile updated successfully',
      faceImageUrl: user.faceImageUrl,
    });
  } catch (error) {
    console.error('Update Face Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// Get all instructors
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' });

    const formatted = instructors.map((instructor) => ({
      id: instructor._id.toString(), // Use actual MongoDB _id
      name: `${instructor.title} ${instructor.firstName} ${instructor.lastName}`,
      email: instructor.email,
      status: instructor.isApproved ? 'active' : 'inactive',
      title: instructor.title,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      isApproved: instructor.isApproved
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.editInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const instructor = await User.findOneAndUpdate(
      { _id: id, role: 'instructor' },
      updates,
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    // Return formatted data consistent with getAllInstructors
    const formatted = {
      id: instructor._id.toString(),
      name: `${instructor.title} ${instructor.firstName} ${instructor.lastName}`,
      email: instructor.email,
      status: instructor.isApproved ? 'active' : 'inactive',
      title: instructor.title,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      isApproved: instructor.isApproved
    };

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error editing instructor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findOneAndDelete({ _id: id, role: 'instructor' });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });

    const formatted = students.map((student) => ({
      id: student._id.toString(),
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      matriNumber: student.matriNumber
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ------------------------
// Edit Student
// ------------------------
exports.editStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await User.findOneAndUpdate(
      { _id: id, role: 'student' },
      updates,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const formatted = {
      id: student._id.toString(),
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      matriNumber: student.matriNumber
    };

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error editing student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ------------------------
// Delete Student
// ------------------------
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findOneAndDelete({ _id: id, role: 'student' });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};





