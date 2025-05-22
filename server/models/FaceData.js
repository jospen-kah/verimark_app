const mongoose = require('mongoose');

const faceDataSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Reference to the student
    faceData: { type: [Number], default: [] }, // Array of numbers representing face data
    createdAt: { type: Date, default: Date.now } // Timestamp for when the face data was created
});