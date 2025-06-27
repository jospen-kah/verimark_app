const Attendance = require('../models/Attendance');
const AttendanceLog = require('../models/AttendanceLog');
const { getElevation } = require('../utils/elevation'); // or '../services/elevation.service'
const { isInsidePolygonWithAltitude } = require('../services/geo.service');
const Hall = require('../models/Hall');
const User = require('../models/User');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { compareFace, ensureModelsLoaded } = require('../services/face.service');


// Initiate attendance session
exports.initiateAttendance = async (req, res) => {
  try {
    // Check if user is an instructor
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can initiate attendance.' });
    }

    const { courseId, hallId, startTime, endTime } = req.body;

    if (!startTime) {
      return res.status(400).json({ message: 'startTime is required' });
    }
    if (!endTime) {
      return res.status(400).json({ message: 'endTime is required' });
    }

    const attendance = new Attendance({
      courseId,
      instructorId: req.user._id,
      hallId,
      startTime: new Date(startTime), // Use provided startTime
      endTime: new Date(endTime),     // Use provided endTime
      status: 'open'
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance initiated successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//verify it student is inside the hall geofence with altitude
exports.verifyGeofence = async (req, res) => {
  try {
    const { latitude, longitude, attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ message: 'Attendance session ID is required' });
    }

    const session = await Attendance.findOne({ _id: attendanceId, status: 'open' }).populate('hallId');
    if (!session) {
      return res.status(404).json({ message: 'No active attendance session found' });
    }

    const hall = session.hallId;

    // Get altitude from external API
    const altitude = await getElevation(latitude, longitude);

    // Check geofence with altitude
    const isInside = isInsidePolygonWithAltitude(
      { latitude, longitude, altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    return res.status(200).json({ inside: isInside });
  } catch (err) {
    console.error('Verify geofence error:', err);
    res.status(500).json({ message: err.message });
  }
};



const FaceData = require('../models/FaceData'); // Make sure to import your FaceData model

// exports.checkIn = async (req, res) => {
//   try {
//     console.log('=== CHECK-IN CONTROLLER START ===');
//     console.log('Request timestamp:', new Date().toISOString());
    
//     const { latitude, longitude, attendanceId } = req.body;
    
//     // Debug logging
//     console.log('Request body:', req.body);
//     console.log('User ID:', req.user?._id);
//     console.log('File received:', !!req.file);
    
//     // Validate required fields
//     if (!attendanceId) {
//       console.log('❌ Missing attendanceId');
//       return res.status(400).json({ 
//         success: false,
//         message: 'Attendance session ID is required' 
//       });
//     }

//     if (!latitude || !longitude) {
//       console.log('❌ Missing coordinates');
//       return res.status(400).json({ 
//         success: false,
//         message: 'Location coordinates are required' 
//       });
//     }

//     // Check if face image is uploaded
//     if (!req.file) {
//       console.log('❌ No file uploaded');
//       return res.status(400).json({ 
//         success: false,
//         message: 'Face image is required for check-in' 
//       });
//     }

//     // Enhanced file validation
//     console.log('=== FILE VALIDATION ===');
//     console.log('File fieldname:', req.file.fieldname);
//     console.log('File originalname:', req.file.originalname);
//     console.log('File mimetype:', req.file.mimetype);
//     console.log('File size:', req.file.size);
    
//     // Validate file type
//     const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
//     if (!allowedMimeTypes.includes(req.file.mimetype)) {
//       console.log('❌ Invalid file type:', req.file.mimetype);
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid image format. Please upload JPEG, PNG, or WebP images only.' 
//       });
//     }
    
//     // Validate file size (max 10MB)
//     const maxSize = 10 * 1024 * 1024; // 10MB
//     if (req.file.size > maxSize) {
//       console.log('❌ File too large:', req.file.size);
//       return res.status(400).json({ 
//         success: false,
//         message: 'Image file too large. Maximum size is 10MB.' 
//       });
//     }
    
//     // Validate minimum file size (at least 1KB)
//     if (req.file.size < 1024) {
//       console.log('❌ File too small:', req.file.size);
//       return res.status(400).json({ 
//         success: false,
//         message: 'Image file too small. Please upload a valid image.' 
//       });
//     }

//     console.log('✅ File validation passed');

//     // Ensure face recognition models are loaded
//     try {
//       console.log('Ensuring face recognition models are loaded...');
//       await ensureModelsLoaded();
//       console.log('✅ Face recognition models ready');
//     } catch (modelError) {
//       console.error('❌ Face model loading error:', modelError);
//       return res.status(500).json({ 
//         success: false,
//         message: 'Face recognition system not available. Please try again later.' 
//       });
//     }

//     // Find attendance session
//     const session = await Attendance.findOne({ _id: attendanceId, status: 'open' })
//       .populate('hallId');

//     if (!session) {
//       console.log('❌ No active session found');
//       return res.status(404).json({ 
//         success: false,
//         message: 'No active session found for this ID' 
//       });
//     }

//     console.log('✅ Attendance session found:', session._id);
//     const hall = session.hallId;

//     // Get altitude from external API
//     console.log('Getting elevation for coordinates:', { latitude, longitude });
//     const altitude = await getElevation(latitude, longitude);
//     console.log(`Altitude for coordinates (${latitude}, ${longitude}): ${altitude}`);

//     // Validate geofence including altitude
//     console.log('Validating geofence...');
//     const isInside = isInsidePolygonWithAltitude(
//       { latitude: parseFloat(latitude), longitude: parseFloat(longitude), altitude },
//       hall.coordinates,
//       hall.minAltitude,
//       hall.maxAltitude
//     );

//     console.log(`Point ${latitude}, ${longitude} with altitude ${altitude} is inside polygon:`, isInside);

//     if (!isInside) {
//       console.log('❌ Not inside geofence');
//       return res.status(403).json({ 
//         success: false,
//         message: 'You are not in the hall geofence' 
//       });
//     }

//     console.log('✅ Geofence validation passed');

//     // Check if student already checked in for this session
//     const existingLog = await AttendanceLog.findOne({
//       attendanceId: session._id,
//       studentId: req.user._id
//     });

//     if (existingLog) {
//       console.log('❌ User already checked in');
//       return res.status(400).json({ 
//         success: false,
//         message: 'You have already checked in for this session' 
//       });
//     }

//     console.log('✅ No existing check-in found');

//     // Retrieve and validate face data from FaceData collection
//     console.log('Retrieving face data for student:', req.user._id);
//     const faceDataDoc = await FaceData.findOne({ studentId: req.user._id });
    
//     if (!faceDataDoc) {
//       console.log('❌ No face data document found');
//       return res.status(400).json({ 
//         success: false,
//         message: 'No face data registered for this user. Please register your face first.' 
//       });
//     }

//     // Enhanced face data validation
//     console.log('=== FACE DATA VALIDATION ===');
//     console.log('Face data document ID:', faceDataDoc._id);
//     console.log('Face data exists:', !!faceDataDoc.faceData);
//     console.log('Face data type:', typeof faceDataDoc.faceData);
//     console.log('Face data is array:', Array.isArray(faceDataDoc.faceData));
//     console.log('Face data length:', faceDataDoc.faceData?.length);
    
//     if (!faceDataDoc.faceData || !Array.isArray(faceDataDoc.faceData)) {
//       console.log('❌ Invalid face data format - not an array');
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid face data format. Please re-register your face.' 
//       });
//     }
    
//     if (faceDataDoc.faceData.length !== 128) {
//       console.log('❌ Invalid face data length:', faceDataDoc.faceData.length);
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid face data format. Please re-register your face.' 
//       });
//     }
    
//     // Check for invalid values in face data
//     const hasInvalidValues = faceDataDoc.faceData.some(val => 
//       typeof val !== 'number' || isNaN(val) || !isFinite(val)
//     );
    
//     if (hasInvalidValues) {
//       console.log('❌ Face data contains invalid values');
//       return res.status(400).json({ 
//         success: false,
//         message: 'Corrupted face data. Please re-register your face.' 
//       });
//     }

//     // ENHANCED: Additional face data validation using service
//     const { validateStoredFaceData } = require('../services/face.service');
//     const validation = validateStoredFaceData(faceDataDoc.faceData);
//     if (!validation.valid) {
//       console.log('❌ Face data validation failed:', validation.error);
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid stored face data. Please re-register your face.' 
//       });
//     }

//     console.log('✅ Face data validation passed');
//     console.log('Face data sample:', faceDataDoc.faceData.slice(0, 5));

//     // Get and validate image buffer
//     let imageBuffer;
    
//     try {
//       if (req.file.buffer) {
//         // Memory storage
//         console.log('Using memory storage buffer');
//         imageBuffer = req.file.buffer;
//       } else if (req.file.path) {
//         // Disk storage - read file
//         console.log('Reading file from disk storage:', req.file.path);
//         const fs = require('fs');
//         imageBuffer = fs.readFileSync(req.file.path);
//         console.log('✅ File read from disk, buffer length:', imageBuffer.length);
        
//         // Clean up file after reading
//         fs.unlinkSync(req.file.path);
//         console.log('✅ Temporary file cleaned up');
//       } else {
//         throw new Error('No buffer or path available in uploaded file');
//       }
//     } catch (fileError) {
//       console.error('❌ Error processing uploaded file:', fileError);
//       return res.status(500).json({ 
//         success: false,
//         message: 'Error processing uploaded image' 
//       });
//     }

//     // Final image buffer validation
//     if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
//       console.log('❌ Invalid image buffer');
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid image data received' 
//       });
//     }

//     console.log('✅ Image buffer ready, length:', imageBuffer.length);

//     // Perform face verification with enhanced error handling
//     let faceVerificationResult;
//     try {
//       console.log('=== FACE VERIFICATION START ===');
//       console.log('Starting face comparison...');
//       console.log('Image buffer length:', imageBuffer.length);
//       console.log('Stored face data length:', faceDataDoc.faceData.length);
      
//       // Call the enhanced compareFace function
//       faceVerificationResult = await compareFace(imageBuffer, faceDataDoc.faceData);
      
//       console.log('=== FACE VERIFICATION RESULT ===');
//       console.log('Verification completed successfully');
//       console.log('Result:', JSON.stringify(faceVerificationResult, null, 2));
      
//     } catch (faceError) {
//       console.error('❌ Face verification error:', faceError);
//       console.error('Face error stack:', faceError.stack);
      
//       // Provide more specific error messages based on error type
//       let errorMessage = 'Face verification failed due to technical error';
      
//       if (faceError.message.includes('No face detected')) {
//         errorMessage = 'No face detected in the image. Please ensure your face is clearly visible and well-lit.';
//       } else if (faceError.message.includes('Image too small')) {
//         errorMessage = 'Image resolution too low for face detection. Please use a higher quality image.';
//       } else if (faceError.message.includes('Image too large')) {
//         errorMessage = 'Image file too large for processing. Please use a smaller image.';
//       } else if (faceError.message.includes('Invalid image format')) {
//         errorMessage = 'Invalid or corrupted image. Please try with a different image.';
//       } else if (faceError.message.includes('descriptor')) {
//         errorMessage = 'Face processing failed. Please try again or re-register your face.';
//       }
      
//       return res.status(500).json({ 
//         success: false,
//         message: errorMessage,
//         error: process.env.NODE_ENV === 'development' ? faceError.message : undefined
//       });
//     }

//     // CRITICAL: Stricter validation
//     if (!faceVerificationResult || typeof faceVerificationResult !== 'object') {
//       console.log('❌ Invalid face verification result format');
//       return res.status(500).json({ 
//         success: false,
//         message: 'Face verification system error' 
//       });
//     }

//     // Enhanced match validation
//     const isMatch = faceVerificationResult.match === true;
//     const confidence = faceVerificationResult.confidence || 0;
//     const distance = faceVerificationResult.distance || 1;
//     const matchQuality = faceVerificationResult.matchQuality || 'unknown';

//     // ADDITIONAL SECURITY: Multiple validation checks
//     const validMatch = isMatch && 
//                       confidence >= 0.3 && 
//                       distance < 0.4 && 
//                       faceVerificationResult.matchQuality !== 'no_match';

//     console.log('=== ENHANCED FACE MATCH ANALYSIS ===');
//     console.log('Face Match:', isMatch);
//     console.log('Confidence:', (confidence * 100).toFixed(2) + '%');
//     console.log('Distance:', distance.toFixed(4));
//     console.log('Match Quality:', matchQuality);
//     console.log('Valid Match (Enhanced):', validMatch);

//     if (!validMatch) {
//       console.log('❌ Face verification failed - enhanced validation');
//       console.log('Match:', isMatch, 'Confidence:', confidence, 'Distance:', distance);
      
//       // Provide different messages based on match quality and confidence
//       let rejectionMessage = 'Face verification failed. Access denied.';
      
//       if (matchQuality === 'poor' || matchQuality === 'no_match') {
//         rejectionMessage = 'Face verification failed. The image quality might be too low or lighting conditions poor. Please try again with better lighting.';
//       } else if (confidence < 0.3) {
//         rejectionMessage = 'Face verification failed. Confidence level too low. Please ensure you are the registered user and try again.';
//       } else if (distance >= 0.4) {
//         rejectionMessage = 'Face verification failed. Face does not match registered profile closely enough.';
//       }
      
//       return res.status(403).json({ 
//         success: false,
//         message: rejectionMessage,
//         details: process.env.NODE_ENV === 'development' ? {
//           confidence: confidence,
//           distance: distance,
//           matchQuality: matchQuality,
//           isMatch: isMatch,
//           validMatch: validMatch
//         } : undefined
//       });
//     }

//     console.log('✅ Enhanced face verification successful');

//     // Create check-in log with verification details
//     console.log('Creating attendance log...');
//     const log = new AttendanceLog({
//       attendanceId: session._id,
//       studentId: req.user._id,
//       checkInTime: new Date(),
//       faceVerified: true,
//       faceVerificationDetails: {
//         confidence: confidence,
//         distance: distance,
//         matchQuality: matchQuality,
//         timestamp: faceVerificationResult.timestamp,
//         enhancedValidation: true // Flag to indicate enhanced validation was used
//       },
//       location: {
//         latitude: parseFloat(latitude),
//         longitude: parseFloat(longitude),
//         altitude: altitude
//       }
//     });

//     await log.save();
//     console.log('✅ Attendance log saved:', log._id);

//     console.log('=== CHECK-IN SUCCESSFUL ===');
    
//     res.status(200).json({ 
//       success: true,
//       message: 'Check-in logged successfully with enhanced face verification', 
//       log: {
//         id: log._id,
//         checkInTime: log.checkInTime,
//         faceVerified: log.faceVerified,
//         confidence: (confidence * 100).toFixed(1) + '%',
//         matchQuality: matchQuality,
//         location: log.location,
//         enhancedSecurity: true
//       }
//     });

//   } catch (err) {
//     console.error('❌ CHECK-IN CONTROLLER ERROR:', err);
//     console.error('Error stack:', err.stack);
    
//     // Clean up uploaded file in case of error (disk storage)
//     if (req.file && req.file.path) {
//       try {
//         const fs = require('fs');
//         if (fs.existsSync(req.file.path)) {
//           fs.unlinkSync(req.file.path);
//           console.log('✅ Cleaned up temporary file after error');
//         }
//       } catch (cleanupError) {
//         console.error('❌ File cleanup error:', cleanupError);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error during check-in',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// Check-out controller

exports.checkIn = async (req, res) => {
  try {
    console.log('=== CHECK-IN CONTROLLER START ===');
    console.log('Request timestamp:', new Date().toISOString());
    
    const { latitude, longitude, attendanceId } = req.body;
    
    // Debug logging
    console.log('Request body:', req.body);
    console.log('User ID:', req.user?._id);
    console.log('File received:', !!req.file);
    
    // Validate required fields
    if (!attendanceId) {
      console.log('❌ Missing attendanceId');
      return res.status(400).json({ 
        success: false,
        message: 'Attendance session ID is required' 
      });
    }

    if (!latitude || !longitude) {
      console.log('❌ Missing coordinates');
      return res.status(400).json({ 
        success: false,
        message: 'Location coordinates are required' 
      });
    }

    // Check if face image is uploaded
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        message: 'Face image is required for check-in' 
      });
    }

    // Enhanced file validation
    console.log('=== FILE VALIDATION ===');
    console.log('File fieldname:', req.file.fieldname);
    console.log('File originalname:', req.file.originalname);
    console.log('File mimetype:', req.file.mimetype);
    console.log('File size:', req.file.size);
    
    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.log('❌ Invalid file type:', req.file.mimetype);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid image format. Please upload JPEG, PNG, or WebP images only.' 
      });
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      console.log('❌ File too large:', req.file.size);
      return res.status(400).json({ 
        success: false,
        message: 'Image file too large. Maximum size is 10MB.' 
      });
    }
    
    // Validate minimum file size (at least 1KB)
    if (req.file.size < 1024) {
      console.log('❌ File too small:', req.file.size);
      return res.status(400).json({ 
        success: false,
        message: 'Image file too small. Please upload a valid image.' 
      });
    }

    console.log('✅ File validation passed');

    // Ensure face recognition models are loaded
    try {
      console.log('Ensuring face recognition models are loaded...');
      await ensureModelsLoaded();
      console.log('✅ Face recognition models ready');
    } catch (modelError) {
      console.error('❌ Face model loading error:', modelError);
      return res.status(500).json({ 
        success: false,
        message: 'Face recognition system not available. Please try again later.' 
      });
    }

    // Find attendance session
    const session = await Attendance.findOne({ _id: attendanceId, status: 'open' })
      .populate('hallId');

    if (!session) {
      console.log('❌ No active session found');
      return res.status(404).json({ 
        success: false,
        message: 'No active session found for this ID' 
      });
    }

    console.log('✅ Attendance session found:', session._id);
    const hall = session.hallId;

    // Get altitude from external API
    console.log('Getting elevation for coordinates:', { latitude, longitude });
    const altitude = await getElevation(latitude, longitude);
    console.log(`Altitude for coordinates (${latitude}, ${longitude}): ${altitude}`);

    // Validate geofence including altitude
    console.log('Validating geofence...');
    const isInside = isInsidePolygonWithAltitude(
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude), altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    console.log(`Point ${latitude}, ${longitude} with altitude ${altitude} is inside polygon:`, isInside);

    if (!isInside) {
      console.log('❌ Not inside geofence');
      return res.status(403).json({ 
        success: false,
        message: 'You are not in the hall geofence' 
      });
    }

    console.log('✅ Geofence validation passed');

    // Check if student already checked in for this session
    const existingLog = await AttendanceLog.findOne({
      attendanceId: session._id,
      studentId: req.user._id
    });

    if (existingLog) {
      console.log('❌ User already checked in');
      return res.status(400).json({ 
        success: false,
        message: 'You have already checked in for this session' 
      });
    }

    console.log('✅ No existing check-in found');

    // Retrieve and validate face data from FaceData collection
    console.log('Retrieving face data for student:', req.user._id);
    const faceDataDoc = await FaceData.findOne({ studentId: req.user._id });
    
    if (!faceDataDoc) {
      console.log('❌ No face data document found');
      return res.status(400).json({ 
        success: false,
        message: 'No face data registered for this user. Please register your face first.' 
      });
    }

    // Enhanced face data validation
    console.log('=== FACE DATA VALIDATION ===');
    console.log('Face data document ID:', faceDataDoc._id);
    console.log('Face data exists:', !!faceDataDoc.faceData);
    console.log('Face data type:', typeof faceDataDoc.faceData);
    console.log('Face data is array:', Array.isArray(faceDataDoc.faceData));
    console.log('Face data length:', faceDataDoc.faceData?.length);
    
    if (!faceDataDoc.faceData || !Array.isArray(faceDataDoc.faceData)) {
      console.log('❌ Invalid face data format - not an array');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid face data format. Please re-register your face.' 
      });
    }
    
    if (faceDataDoc.faceData.length !== 128) {
      console.log('❌ Invalid face data length:', faceDataDoc.faceData.length);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid face data format. Please re-register your face.' 
      });
    }
    
    // Check for invalid values in face data
    const hasInvalidValues = faceDataDoc.faceData.some(val => 
      typeof val !== 'number' || isNaN(val) || !isFinite(val)
    );
    
    if (hasInvalidValues) {
      console.log('❌ Face data contains invalid values');
      return res.status(400).json({ 
        success: false,
        message: 'Corrupted face data. Please re-register your face.' 
      });
    }

    // ENHANCED: Additional face data validation using service
    const { validateStoredFaceData } = require('../services/face.service');
    const validation = validateStoredFaceData(faceDataDoc.faceData);
    if (!validation.valid) {
      console.log('❌ Face data validation failed:', validation.error);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid stored face data. Please re-register your face.' 
      });
    }

    console.log('✅ Face data validation passed');
    console.log('Face data sample:', faceDataDoc.faceData.slice(0, 5));

    // Get and validate image buffer
    let imageBuffer;
    
    try {
      if (req.file.buffer) {
        // Memory storage
        console.log('Using memory storage buffer');
        imageBuffer = req.file.buffer;
      } else if (req.file.path) {
        // Disk storage - read file
        console.log('Reading file from disk storage:', req.file.path);
        const fs = require('fs');
        imageBuffer = fs.readFileSync(req.file.path);
        console.log('✅ File read from disk, buffer length:', imageBuffer.length);
        
        // Clean up file after reading
        fs.unlinkSync(req.file.path);
        console.log('✅ Temporary file cleaned up');
      } else {
        throw new Error('No buffer or path available in uploaded file');
      }
    } catch (fileError) {
      console.error('❌ Error processing uploaded file:', fileError);
      return res.status(500).json({ 
        success: false,
        message: 'Error processing uploaded image' 
      });
    }

    // Final image buffer validation
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
      console.log('❌ Invalid image buffer');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid image data received' 
      });
    }

    console.log('✅ Image buffer ready, length:', imageBuffer.length);

    // Perform face verification with enhanced error handling
    let faceVerificationResult;
    try {
      console.log('=== FACE VERIFICATION START ===');
      console.log('Starting face comparison...');
      console.log('Image buffer length:', imageBuffer.length);
      console.log('Stored face data length:', faceDataDoc.faceData.length);
      
      // Call the enhanced compareFace function
      faceVerificationResult = await compareFace(imageBuffer, faceDataDoc.faceData);
      
      console.log('=== FACE VERIFICATION RESULT ===');
      console.log('Verification completed successfully');
      console.log('Result:', JSON.stringify(faceVerificationResult, null, 2));
      
    } catch (faceError) {
      console.error('❌ Face verification error:', faceError);
      console.error('Face error stack:', faceError.stack);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Face verification failed due to technical error';
      
      if (faceError.message.includes('No face detected')) {
        errorMessage = 'No face detected in the image. Please ensure your face is clearly visible and well-lit.';
      } else if (faceError.message.includes('Image too small')) {
        errorMessage = 'Image resolution too low for face detection. Please use a higher quality image.';
      } else if (faceError.message.includes('Image too large')) {
        errorMessage = 'Image file too large for processing. Please use a smaller image.';
      } else if (faceError.message.includes('Invalid image format')) {
        errorMessage = 'Invalid or corrupted image. Please try with a different image.';
      } else if (faceError.message.includes('descriptor')) {
        errorMessage = 'Face processing failed. Please try again or re-register your face.';
      }
      
      return res.status(500).json({ 
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? faceError.message : undefined
      });
    }

    // CRITICAL: Stricter validation
    if (!faceVerificationResult || typeof faceVerificationResult !== 'object') {
      console.log('❌ Invalid face verification result format');
      return res.status(500).json({ 
        success: false,
        message: 'Face verification system error' 
      });
    }

    // Enhanced match validation
    const isMatch = faceVerificationResult.match === true;
    const confidence = faceVerificationResult.confidence || 0;
    const distance = faceVerificationResult.distance || 1;
    const matchQuality = faceVerificationResult.matchQuality || 'unknown';

    // ADDITIONAL SECURITY: Multiple validation checks
    const validMatch = isMatch && 
                      confidence >= 0.3 && 
                      distance < 0.4 && 
                      faceVerificationResult.matchQuality !== 'no_match';

    console.log('=== ENHANCED FACE MATCH ANALYSIS ===');
    console.log('Face Match:', isMatch);
    console.log('Confidence:', (confidence * 100).toFixed(2) + '%');
    console.log('Distance:', distance.toFixed(4));
    console.log('Match Quality:', matchQuality);
    console.log('Valid Match (Enhanced):', validMatch);

    if (!validMatch) {
      console.log('❌ Face verification failed - enhanced validation');
      console.log('Match:', isMatch, 'Confidence:', confidence, 'Distance:', distance);
      
      // Provide different messages based on match quality and confidence
      let rejectionMessage = 'Face verification failed. Access denied.';
      
      if (matchQuality === 'poor' || matchQuality === 'no_match') {
        rejectionMessage = 'Face verification failed. The image quality might be too low or lighting conditions poor. Please try again with better lighting.';
      } else if (confidence < 0.3) {
        rejectionMessage = 'Face verification failed. Confidence level too low. Please ensure you are the registered user and try again.';
      } else if (distance >= 0.4) {
        rejectionMessage = 'Face verification failed. Face does not match registered profile closely enough.';
      }
      
      return res.status(403).json({ 
        success: false,
        message: rejectionMessage,
        details: process.env.NODE_ENV === 'development' ? {
          confidence: confidence,
          distance: distance,
          matchQuality: matchQuality,
          isMatch: isMatch,
          validMatch: validMatch
        } : undefined
      });
    }

    console.log('✅ Enhanced face verification successful');

    // Create check-in log with verification details
    console.log('Creating attendance log...');
    const log = new AttendanceLog({
      attendanceId: session._id,
      studentId: req.user._id,
      checkInTime: new Date(),
      faceVerified: true,
      faceVerificationDetails: {
        confidence: confidence,
        distance: distance,
        matchQuality: matchQuality,
        timestamp: faceVerificationResult.timestamp,
        enhancedValidation: true // Flag to indicate enhanced validation was used
      },
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        altitude: altitude
      }
    });

    await log.save();
    console.log('✅ Attendance log saved:', log._id);

    console.log('=== CHECK-IN SUCCESSFUL ===');
    
    res.status(200).json({ 
      success: true,
      message: 'Check-in logged successfully with enhanced face verification', 
      log: {
        id: log._id,
        checkInTime: log.checkInTime,
        faceVerified: log.faceVerified,
        confidence: (confidence * 100).toFixed(1) + '%',
        matchQuality: matchQuality,
        location: log.location,
        enhancedSecurity: true
      }
    });

  } catch (err) {
    console.error('❌ CHECK-IN CONTROLLER ERROR:', err);
    console.error('Error stack:', err.stack);
    
    // Clean up uploaded file in case of error (disk storage)
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('✅ Cleaned up temporary file after error');
        }
      } catch (cleanupError) {
        console.error('❌ File cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during check-in',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { attendanceId, latitude, longitude } = req.body;

    // Find the specific attendance session
    const session = await Attendance.findOne({ _id: attendanceId, status: 'open' })
      .populate('hallId');

    if (!session) return res.status(404).json({ message: 'No active session found for the given attendanceId' });

    const hall = session.hallId;

    // Get current altitude from external service
    const altitude = await getElevation(latitude, longitude);

    // Check if user is inside the hall geofence (with altitude)
    const isInside = isInsidePolygonWithAltitude(
      { latitude, longitude, altitude },
      hall.coordinates,
      hall.minAltitude,
      hall.maxAltitude
    );

    if (!isInside) {
      return res.status(403).json({ message: 'You are not within the geofenced hall area' });
    }

    // Find the most recent check-in for this session without a checkout
    const lastLog = await AttendanceLog.findOne({
      attendanceId,
      studentId: req.user._id,
      checkOutTime: { $exists: false }
    }).sort({ checkInTime: -1 });

    if (!lastLog) {
      return res.status(400).json({ message: 'No open check-in record found to check out from' });
    }

    lastLog.checkOutTime = new Date();
    await lastLog.save();

    res.status(200).json({ message: 'Check-out logged successfully', log: lastLog });
  } catch (err) {
    console.error('Check-out error:', err.message);
    res.status(500).json({ message: err.message });
  }
};


exports.getAttendanceSessionSummary = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const summary = await AttendanceLog.aggregate([
      {
        $match: {
          attendanceId: new mongoose.Types.ObjectId(attendanceId)
        }
      },
      {
        $group: {
          _id: '$studentId',
          totalTimeMs: {
            $sum: {
              $subtract: [
                { $ifNull: ['$checkOutTime', new Date()] },
                '$checkInTime'
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $match: { 'studentInfo.role': 'student' }
      },
      {
        $project: {
          studentId: '$_id',
          firstName: '$studentInfo.firstName',
          lastName: '$studentInfo.lastName',
          matriNumber: '$studentInfo.matriNumber',
          totalMinutes: { $floor: { $divide: ['$totalTimeMs', 60000] } },
          attendanceStatus: {
            $cond: [
              { $gte: [{ $divide: ['$totalTimeMs', 60000] }, 60] },
              'present',
              'absent'
            ]
          }
        }
      }
    ]);

    res.status(200).json(summary);
  } catch (err) {
    console.error('Attendance session summary error:', err.message);
    res.status(500).json({ message: err.message });
  }
};



exports.getAttendanceSummary = async (req, res) => {
  try {
    const { attendanceId, studentId } = req.params;

    const logs = await AttendanceLog.find({
      attendanceId: new mongoose.Types.ObjectId(attendanceId),
      studentId: new mongoose.Types.ObjectId(studentId)
    });

    const totalMs = logs.reduce((acc, log) => {
      const end = log.checkOutTime || new Date();
      return acc + (end - log.checkInTime);
    }, 0);

    const totalMinutes = Math.floor(totalMs / 60000);
    const attendanceStatus = totalMinutes >= 60 ? 'present' : 'absent';

    const student = await User.findById(studentId).select('firstName lastName matriNumber');

    res.status(200).json({
      attendanceId,
      studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      matriNumber: student.matriNumber,
      totalMinutes,
      attendanceStatus
    });
  } catch (err) {
    console.error('Attendance summary error:', err.message);
    res.status(500).json({ message: err.message });
  }
};





exports.getOpenAttendances = async (req, res) => {
  try {
    const sessions = await Attendance.find({ status: 'open' })
      .populate('courseId', 'code title')     // Only get code and name
      .populate('hallId', 'name');           // Only get hall name

    const formatted = sessions.map(session => ({
      attendanceId: session._id,
      courseCode: session.courseId.code,
      courseName: session.courseId.title,
      hallName: session.hallId.name,
      startTime: session.startTime,
      endTime: session.endTime,
    }));
    console.log('Sessions fetched:', JSON.stringify(sessions, null, 2));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching open attendances:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// End attendance session (instructor only)
exports.endSession = async (req, res) => {
  try {
    // Check if user is an instructor
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can end a session.' });
    }

    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ message: 'attendanceId is required.' });
    }

    // Find the attendance session
    const session = await Attendance.findById(attendanceId);

    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found.' });
    }

    // Only the instructor who started the session can end it
    if (session.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to end this session.' });
    }

    // Set status to closed and update endTime
    session.status = 'closed';
    session.endTime = new Date();
    await session.save();

    res.status(200).json({ message: 'Attendance session ended successfully.', session });
  } catch (err) {
    console.error('End session error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all attendances initiated by the logged-in instructor
exports.getInstructorAttendances = async (req, res) => {
  try {
    // Ensure only instructors can access their sessions
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can view their attendances.' });
    }

    const sessions = await Attendance.find({ instructorId: req.user._id })
      .populate('courseId', 'code title')
      .populate('hallId', 'name');

    const formatted = sessions.map(session => ({
      attendanceId: session._id,
      courseCode: session.courseId.code,
      courseName: session.courseId.title,
      hallName: session.hallId.name,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching instructor attendances:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAttendanceSession = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    // Validate attendanceId
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID is required'
      });
    }

    // Find the attendance session by ID and populate related data
    const session = await Attendance.findById(attendanceId)
      .populate({
        path: 'courseId',
        select: 'courseCode courseName',
        model: Course
      })
      .populate({
        path: 'hallId',
        select: 'hallName',
        model: Hall
      })
      .select('startTime endTime status createdAt');

    // Check if session exists
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found'
      });
    }

    // Debug logging - remove in production
    console.log('Session data:', {
      id: session._id,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      currentTime: new Date()
    });

    // Check if session is still active
    const currentTime = new Date();
    // Handle both string and Date types for endTime
    const sessionEndTime = session.endTime instanceof Date 
      ? session.endTime 
      : new Date(session.endTime);
    
    // More detailed validation with better error messages
    if (session.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This attendance session is closed',
        debug: {
          status: session.status,
          currentTime: currentTime.toISOString(),
          endTime: sessionEndTime.toISOString()
        }
      });
    }

    if (currentTime > sessionEndTime) {
      return res.status(400).json({
        success: false,
        message: 'This attendance session has ended',
        debug: {
          currentTime: currentTime.toISOString(),
          endTime: sessionEndTime.toISOString(),
          timeDifference: currentTime - sessionEndTime
        }
      });
    }

    // Format the response
    const sessionData = {
      attendanceId: session._id,
      courseCode: session.courseId?.courseCode || 'N/A',
      courseName: session.courseId?.courseName || 'Unknown Course',
      hallName: session.hallId?.hallName || 'Unknown Hall',
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      createdAt: session.createdAt,
      // Add time remaining for debugging
      timeRemaining: sessionEndTime ? Math.max(0, sessionEndTime - currentTime) : null
    };

    res.status(200).json({
      success: true,
      data: sessionData,
      message: 'Session details retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching attendance session:', error);
    
    // Handle different types of errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching session details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};





