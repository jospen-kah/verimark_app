const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/faces';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

// Memory storage for face verification (provides buffer)
const storage = multer.memoryStorage();

// File filter (only images)
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only .jpeg, .jpg, .png files are allowed');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer configuration
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file at a time
  }
});

module.exports = upload;