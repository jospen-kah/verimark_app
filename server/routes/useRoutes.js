const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const userController = require('../controllers/user.controller');
const {protect, restrictTo} = require('../middlewares/authMiddleware'); // your JWT auth middleware

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

router.get('/instructors', 
  // protect,
  // restrictTo('admin'), 
  userController.getAllInstructors);

router.get('/students', 
  // protect,
  // restrictTo('admin'),
  userController.getAllStudents);

  // Instructor edit & delete
router.put('/instructors/:id', 
  // protect,
  // restrictTo('admin'),
  userController.editInstructor);

router.delete('/instructors/:id', 
  // protect,
  // restrictTo('admin'),
  userController.deleteInstructor);

// Student edit & delete
router.put('/students/:id', 
  // protect,
  // restrictTo('admin'),
  userController.editStudent);


router.delete('/students/:id', 
  // protect,
  // restrictTo('admin'),
  userController.deleteStudent);
router.get('/:id', userController.getUser);

module.exports = router;
