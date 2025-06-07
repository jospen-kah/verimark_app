const Course = require('../models/Course');

// @desc    Admin creates a new course and assigns it to an instructor
exports.createCourse = async (req, res) => {
  try {
    const { title, code, instructorId } = req.body;

    if (!instructorId) {
      return res.status(400).json({ message: 'Instructor ID is required' });
    }

    const course = new Course({
      title,
      code,
      instructorId
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Edit course details
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code } = req.body;

    const course = await Course.findById(id);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only the instructor who created it or an admin can edit it
    if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    course.title = title || course.title;
    course.code = code || course.code;

    await course.save();
    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get course details
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).populate('instructorId', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
    //.populate('instructorId', 'name email');
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
