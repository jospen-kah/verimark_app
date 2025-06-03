const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const userController = require('../controllers/user.controller');
const {protect} = require('../middlewares/authMiddleware'); // your JWT auth middleware

// Upload face profile
router.post(
  '/upload-face',
  protect,
  upload.single('faceImage'),
  userController.uploadFaceProfile
);
  
// Update face profile
router.put(
  '/update-face',
  protect,
  upload.single('faceImage'),
  userController.updateFaceProfile
);

module.exports = router;
