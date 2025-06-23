const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const {
  registerFace,
  verifyFace,
  updateFaceData,
  checkFaceRegistrationStatus,
} = require('../controllers/face.controller');

// Only authenticated students can access these routes
router.post('/register', protect, restrictTo('student'), upload.single('image'), registerFace);
router.post('/verify', protect, restrictTo('student'), upload.single('image'), verifyFace);
router.put('/update', protect, restrictTo('student'), upload.single('image'), updateFaceData);
router.get('/check-status', protect, restrictTo('student'), checkFaceRegistrationStatus);

module.exports = router;
