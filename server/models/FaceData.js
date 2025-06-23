const mongoose = require('mongoose');

const faceDataSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Reference to the student
    faceData: { type: [Number], default: [] }, // Array of numbers representing face data
    registerStatus: { type: Boolean, default: false }, // Registration status - true when registered, false when needs admin approval for updates
    isApprovedForUpdate: { type: Boolean, default: false }, // Admin approval for face updates
    registrationDate: { type: Date }, // Date when face was first registered
    lastUpdateDate: { type: Date }, // Date of last face update
    createdAt: { type: Date, default: Date.now } // Timestamp for when the face data was created
});

module.exports = mongoose.model('FaceData', faceDataSchema);