const Course = require('../models/Course');
const mongoose = require('mongoose');

// @desc    Edit course details
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, instructor, instructorId, createdDate } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    // Only admin can edit courses (since auth is commented out)
    // if (req.user && req.user.role !== 'admin' && course.instructorId && course.instructorId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ 
    //     success: false,
    //     message: 'Not authorized to edit this course' 
    //   });
    // }

    // Update fields
    course.title = title || course.title;
    course.code = code || course.code;
    if (instructor) course.instructor = instructor;
    if (instructorId) course.instructorId = instructorId;
    if (createdDate) course.createdDate = createdDate;

    await course.save();

    res.status(200).json({ 
      success: true,
      message: 'Course updated successfully', 
      data: course 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// @desc    Get course details
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).populate('instructorId', 'name email');

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      data: course 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// @desc    Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructorId', 'firstName lastName title email'); // Changed 'name' to 'firstName lastName title'
    
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
// Get courses by instructor ID (new endpoint)
exports.getCoursesByInstructor = async (req, res) => {
  try {
    console.log('getCoursesByInstructor called');
    console.log('req.params:', req.params);
    
    const { instructorId } = req.params;
    console.log('Extracted instructorId:', instructorId);
    
    if (!instructorId) {
      console.log('No instructorId provided');
      return res.status(400).json({
        success: false,
        message: 'Instructor ID is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      console.log('Invalid ObjectId format:', instructorId);
      return res.status(400).json({
        success: false,
        message: 'Invalid instructor ID format'
      });
    }

    console.log('Searching for courses with instructorId:', instructorId);
    const courses = await Course.find({ instructorId }).populate('instructorId', 'name email');
    console.log('Found courses:', courses);
    
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error in getCoursesByInstructor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor courses',
      error: error.message
    });
  }
};
// Also add/update other course methods to handle the date field correctly
exports.createCourse = async (req, res) => {
  try {
    const { title, code, instructorId, createdDate } = req.body;
    
    const course = new Course({
      title,
      code,
      instructorId,
      createdAt: createdDate ? new Date(createdDate) : new Date()
    });
    
    await course.save();
    
    // Populate the instructor data before sending response
    await course.populate('instructorId', 'name email');
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, instructorId, createdDate } = req.body;
    
    const updateData = {
      title,
      code,
      instructorId
    };
    
    // Only update createdAt if createdDate is provided
    if (createdDate) {
      updateData.createdAt = new Date(createdDate);
    }
    
    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('instructorId', 'name email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// @desc    Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    // Only admin can delete courses (since auth is commented out)
    // if (req.user && req.user.role !== 'admin' && course.instructorId && course.instructorId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ 
    //     success: false,
    //     message: 'Not authorized to delete this course' 
    //   });
    // }

    await course.deleteOne();
    
    res.status(200).json({ 
      success: true,
      message: 'Course deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};