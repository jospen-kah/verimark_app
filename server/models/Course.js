const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({  
    courseCode: String,
    courseName: String,
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
});

module.exports = mongoose.model('Course', courseSchema);