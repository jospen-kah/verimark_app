const fs = require('fs'); 
const { processAndEncodeFace, compareFace, validateStoredFaceData } = require('../services/face.service');
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
    // Debug file save (optional)
    fs.writeFileSync('debug_upload_register.jpg', req.file.buffer);

    console.log('=== FACE REGISTRATION START ===');
    console.log('Processing face for user:', req.user._id);

    // processAndEncodeFace returns an object with { descriptor, confidence, hash, timestamp }
    const faceResult = await processAndEncodeFace(req.file.buffer, 'REGISTRATION');
    
    if (!faceResult || !faceResult.descriptor || faceResult.descriptor.length === 0) {
      console.log('❌ No face detected during registration');
      return res.status(400).json({ message: 'No face detected in the uploaded image' });
    }

    console.log('✅ Face processing successful');
    console.log('Descriptor length:', faceResult.descriptor.length);
    console.log('Confidence:', faceResult.confidence);
    console.log('Hash:', faceResult.hash);

    // Validate descriptor
    if (faceResult.descriptor.length !== 128) {
      console.log('❌ Invalid descriptor length:', faceResult.descriptor.length);
      return res.status(400).json({ message: 'Invalid face data generated' });
    }

    // Store the complete face result object (with metadata) in the database
    const faceDataDoc = await FaceData.findOneAndUpdate(
      { studentId: req.user._id },
      { 
        faceData: faceResult.descriptor, // Store just the descriptor array for backward compatibility
        faceMetadata: {
          confidence: faceResult.confidence,
          hash: faceResult.hash,
          timestamp: faceResult.timestamp,
          debugId: faceResult.debugId
        }
      },
      { upsert: true, new: true }
    );

    console.log('✅ Face data saved to database');
    console.log('Document ID:', faceDataDoc._id);
    console.log('=== FACE REGISTRATION END ===');

    return res.status(200).json({ 
      message: 'Face registered successfully',
      confidence: faceResult.confidence,
      hash: faceResult.hash
    });
  } catch (err) {
    console.error('❌ Face registration error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      message: 'Failed to process face image',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.verifyFace = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  try {
    console.log('=== FACE VERIFICATION START ===');
    console.log('Verifying face for user:', req.user._id);

    // Get stored face data from database
    const faceDataDoc = await FaceData.findOne({ studentId: req.user._id });
    
    if (!faceDataDoc || !faceDataDoc.faceData) {
      console.log('❌ No face data registered for user');
      return res.status(400).json({ message: 'No face data registered. Please register your face first.' });
    }

    // ENHANCED FACE DATA VALIDATION
    console.log('=== ENHANCED FACE DATA VALIDATION ===');
    console.log('Face data document ID:', faceDataDoc._id);
    console.log('Raw faceData type:', typeof faceDataDoc.faceData);
    console.log('Raw faceData is array:', Array.isArray(faceDataDoc.faceData));

    const validation = validateStoredFaceData(faceDataDoc.faceData);
    
    if (!validation.valid) {
      console.log('❌ Face data validation failed:', validation.error);
      return res.status(400).json({ 
        success: false,
        message: `Invalid stored face data: ${validation.error}. Please re-register your face.` 
      });
    }

    console.log('✅ Face data validation passed');
    console.log('Validation hash:', validation.hash);
    console.log('Validation sample:', validation.sample);

    console.log('✅ Retrieved stored face data');
    console.log('Stored descriptor length:', faceDataDoc.faceData.length);
    
    // Debug file save (optional)
    fs.writeFileSync('debug_upload_verify.jpg', req.file.buffer);

    // Compare faces using the stored descriptor
    const comparisonResult = await compareFace(req.file.buffer, faceDataDoc.faceData);
    
    console.log('=== VERIFICATION RESULT ===');
    console.log('Match:', comparisonResult.match);
    console.log('Distance:', comparisonResult.distance);
    console.log('Confidence:', (comparisonResult.confidence * 100).toFixed(2) + '%');
    console.log('Match Quality:', comparisonResult.matchQuality);
    console.log('Same Descriptor Warning:', comparisonResult.sameDescriptor);
    console.log('=== FACE VERIFICATION END ===');

    res.status(200).json({ 
      match: comparisonResult.match,
      confidence: comparisonResult.confidence,
      distance: comparisonResult.distance,
      matchQuality: comparisonResult.matchQuality,
      details: process.env.NODE_ENV === 'development' ? {
        threshold: comparisonResult.threshold,
        storedHash: comparisonResult.storedHash,
        queryHash: comparisonResult.queryHash,
        sameDescriptor: comparisonResult.sameDescriptor
      } : undefined
    });

  } catch (error) {
    console.error('❌ Face verification error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Face verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.updateFaceData = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  try {
    console.log('=== FACE UPDATE START ===');
    console.log('Updating face for user:', req.user._id);

    // Process the new face image
    const faceResult = await processAndEncodeFace(req.file.buffer, 'UPDATE');
    
    if (!faceResult || !faceResult.descriptor || faceResult.descriptor.length !== 128) {
      console.log('❌ Invalid face data generated during update');
      return res.status(400).json({ message: 'No valid face detected in the uploaded image' });
    }

    // Update the face data in database
    const updatedDoc = await FaceData.findOneAndUpdate(
      { studentId: req.user._id },
      { 
        faceData: faceResult.descriptor,
        faceMetadata: {
          confidence: faceResult.confidence,
          hash: faceResult.hash,
          timestamp: faceResult.timestamp,
          debugId: faceResult.debugId
        }
      },
      { upsert: true, new: true }
    );

    console.log('✅ Face data updated successfully');
    console.log('New hash:', faceResult.hash);
    console.log('=== FACE UPDATE END ===');

    res.status(200).json({ 
      message: 'Face data updated successfully',
      confidence: faceResult.confidence,
      hash: faceResult.hash
    });

  } catch (error) {
    console.error('❌ Face update error:', error);
    res.status(500).json({ 
      message: 'Failed to update face data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};