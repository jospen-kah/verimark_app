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
  console.log('=== EDIT INSTRUCTOR DEBUG ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('Request method:', req.method);
  
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('Searching for instructor with ID:', id);
    
    const instructor = await User.findOneAndUpdate(
      { _id: id, role: 'instructor' },
      updates,
      { new: true }
    );

    console.log('Found instructor:', instructor);

    if (!instructor) {
      console.log('No instructor found with that ID and role');
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    // Return formatted data
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

    console.log('Returning formatted data:', formatted);
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

// Add new instructor
exports.addInstructor = async (req, res) => {
  try {
    const { title, firstName, lastName, email, isApproved } = req.body;

    // Check if instructor with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new instructor
    const newInstructor = new User({
      title,
      firstName,
      lastName,
      email,
      role: 'instructor',
      isApproved: isApproved || false,
      // You might want to set a default password or require password in the request
      password: 'defaultPassword123', // Consider requiring this in the request body
    });

    const savedInstructor = await newInstructor.save();

    // Return formatted data
    const formatted = {
      id: savedInstructor._id.toString(),
      name: `${savedInstructor.title} ${savedInstructor.firstName} ${savedInstructor.lastName}`,
      email: savedInstructor.email,
      status: savedInstructor.isApproved ? 'active' : 'inactive',
      title: savedInstructor.title,
      firstName: savedInstructor.firstName,
      lastName: savedInstructor.lastName,
      isApproved: savedInstructor.isApproved
    };

    res.status(201).json({ 
      success: true, 
      data: formatted,
      message: 'Instructor added successfully'
    });
  } catch (error) {
    console.error('Error adding instructor:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding instructor' 
    });
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





