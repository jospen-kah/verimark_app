const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Hashed password
    isApproved: { type: Boolean, default: false }, // Approval status
    isApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // Admin who approved
    approvedDate: { type: Date }, // Date of approval
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Instructor', instructorSchema);