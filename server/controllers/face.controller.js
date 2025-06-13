const fs = require('fs'); 
const { processAndEncodeFace, compareFace } = require('../services/face.service');
const FaceData = require('../models/FaceData'); 

function parseEmbedding(embedding) {
  if (typeof embedding === 'string') {
    const matches = embedding.match(/\[([^\[\]]+)\]/);
    if (matches && matches[1]) {
      return matches[1]
        .split(',')
        .map(strNum => parseFloat(strNum.trim()))
        .filter(num => !isNaN(num));
    } else {
      throw new Error('Invalid embedding format');
    }
  }
  // If already array or Float32Array, convert to normal array
  if (embedding instanceof Float32Array) {
    return Array.from(embedding);
  }
  if (Array.isArray(embedding)) {
    return embedding;
  }
  throw new Error('Unknown embedding format');
}

exports.registerFace = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  try {
  fs.writeFileSync('debug_upload_register.jpg', req.file.buffer);

    const embedding = await processAndEncodeFace(req.file.buffer); // must return [Number]
    if (!embedding || embedding.length === 0) {
      return res.status(400).json({ message: 'No face detected' });
    }

    const parsedEmbedding = Array.from(embedding); // Ensure it's a plain array

    // Save to DB
    await FaceData.findOneAndUpdate(
      { studentId: req.user._id },
      { faceData: parsedEmbedding },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: 'Face registered successfully' });
  } catch (err) {
    console.error('Face registration error:', err);
    return res.status(500).json({ message: 'Failed to process face image' });
  }
};

exports.verifyFace = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  try {
    if (!req.user.faceData) {
      return res.status(400).json({ message: 'No face data registered' });
    }

    const match = await compareFace(req.file.buffer, req.user.faceData);
    res.status(200).json({ match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFaceData = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  try {
    let embedding = await processAndEncodeFace(req.file.buffer);
    embedding = parseEmbedding(embedding); // parse to real number array if needed

    req.user.faceData = embedding; // overwrite existing face data
    await req.user.save();

    res.status(200).json({ message: 'Face data updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};