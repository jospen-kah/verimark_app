const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Upload face profile image
exports.uploadFaceProfile = async (req, res) => {
  try {
    const userId = req.user._id; // make sure to authenticate user before
    const imagePath = `/uploads/faces/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { faceImageUrl: imagePath },
      { new: true }
    );

    res.status(200).json({
      message: 'Face profile uploaded successfully',
      faceImageUrl: user.faceImageUrl,
    });
  } catch (error) {
    console.error('Upload Face Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Edit/update face profile image
exports.updateFaceProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.faceImageUrl) {
      // Delete the old image file
      const oldImagePath = path.join(__dirname, '..', user.faceImageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const newImagePath = `/uploads/faces/${req.file.filename}`;

    user.faceImageUrl = newImagePath;
    await user.save();

    res.status(200).json({
      message: 'Face profile updated successfully',
      faceImageUrl: user.faceImageUrl,
    });
  } catch (error) {
    console.error('Update Face Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
