const Course = require('../models/Course'); 
const Attendance = require('../models/Attendance'); 
const User = require('../models/User'); 

/**
 * Get attendance report for a specific course
 * GET /api/reports/attendance/:courseId
 */
exports.getAttendanceReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Validate date format and range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      courseId: courseId,
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });

    // Get total enrolled students for this course
    const totalEnrolledStudents = await Student.countDocuments({
      enrolledCourses: courseId
    });

    // Group attendance by date and calculate statistics
    const attendanceByDate = {};
    
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = {
          date: dateKey,
          totalStudents: totalEnrolledStudents,
          presentStudents: 0,
          attendanceRate: 0
        };
      }
      
      // Count present students for this date
      attendanceByDate[dateKey].presentStudents = record.presentStudents?.length || 0;
      attendanceByDate[dateKey].attendanceRate = Math.round(
        (attendanceByDate[dateKey].presentStudents / totalEnrolledStudents) * 100
      );
    });

    // Convert to array and sort by date
    const attendanceData = Object.values(attendanceByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Calculate summary statistics
    const totalClasses = attendanceData.length;
    const averageAttendance = totalClasses > 0 
      ? Math.round(attendanceData.reduce((sum, day) => sum + day.attendanceRate, 0) / totalClasses)
      : 0;

    const reportData = {
      courseTitle: course.title,
      courseCode: course.code,
      reportType: 'Attendance Report',
      dateRange: `${startDate} to ${endDate}`,
      data: attendanceData,
      summary: {
        totalClasses,
        averageAttendance,
        totalStudentsEnrolled: totalEnrolledStudents
      }
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating attendance report'
    });
  }
};

/**
 * Get student report for a specific course
 * GET /api/reports/students/:courseId
 */
exports.getStudentReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Validate date format and range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get students enrolled in this course
    const students = await User.find({
      enrolledCourses: courseId
    }).select('name matricule');

    if (students.length === 0) {
      return res.json({
        success: true,
        data: {
          courseTitle: course.title,
          courseCode: course.code,
          reportType: 'Student Report',
          dateRange: `${startDate} to ${endDate}`,
          data: [],
          summary: {
            totalStudents: 0,
            averageAttendance: 0,
            highPerformers: 0
          }
        }
      });
    }

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      courseId: courseId,
      date: {
        $gte: start,
        $lte: end
      }
    });

    // Calculate total classes in the date range
    const totalClasses = attendanceRecords.length;

    // Calculate attendance for each student
    const studentAttendanceData = students.map(student => {
      let attendedClasses = 0;

      // Count how many classes this student attended
      attendanceRecords.forEach(record => {
        if (record.presentStudents && record.presentStudents.includes(student._id)) {
          attendedClasses++;
        }
      });

      const attendanceRate = totalClasses > 0 
        ? Math.round((attendedClasses / totalClasses) * 100)
        : 0;

      return {
        id: student._id,
        name: student.name,
        matricule: student.matricule,
        totalClasses,
        attendedClasses,
        attendanceRate
      };
    });

    // Sort by attendance rate (descending)
    studentAttendanceData.sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Calculate summary statistics
    const totalStudents = studentAttendanceData.length;
    const averageAttendance = totalStudents > 0
      ? Math.round(studentAttendanceData.reduce((sum, student) => sum + student.attendanceRate, 0) / totalStudents)
      : 0;
    const highPerformers = studentAttendanceData.filter(student => student.attendanceRate >= 90).length;

    const reportData = {
      courseTitle: course.title,
      courseCode: course.code,
      reportType: 'Student Report',
      dateRange: `${startDate} to ${endDate}`,
      data: studentAttendanceData,
      summary: {
        totalStudents,
        averageAttendance,
        highPerformers
      }
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating student report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating student report'
    });
  }
};

/**
 * Get all courses for report selection
 * GET /api/reports/courses
 */
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}, 'title code').sort({ title: 1 });
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching courses'
    });
  }
};