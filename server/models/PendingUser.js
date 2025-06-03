// models/PendingUser.js
const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String, // hashed
  role: { type: String, enum: ['admin', 'instructor', 'student'] },
  matriNumber: { type: String },
  verificationCode: String,
  codeExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('PendingUser', pendingUserSchema);
