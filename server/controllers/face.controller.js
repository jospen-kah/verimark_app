const { processAndEncodeFace, compareFace } = require('../services/face.service');

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
    let embedding = await processAndEncodeFace(req.file.buffer);
    embedding = parseEmbedding(embedding); // parse to real number array if needed

    req.user.faceData = embedding; // save to DB
    await req.user.save();

    res.status(200).json({ message: 'Face registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
