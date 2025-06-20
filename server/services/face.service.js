// ==== UPDATED FACE SERVICE (face.service.js) ====

const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_URL = path.join(__dirname, '../models/face_api_models');

// Global flag to track if models are loaded
let modelsLoaded = false;

async function loadModels() {
  try {
    if (modelsLoaded) {
      console.log('Models already loaded, skipping...');
      return;
    }

    console.log('Loading face-api models from:', MODEL_URL);
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('All face-api models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    modelsLoaded = false;
    throw new Error(`Failed to load face recognition models: ${error.message}`);
  }
}

async function ensureModelsLoaded() {
  if (!modelsLoaded) {
    await loadModels();
  }
}

async function processAndEncodeFace(imageBuffer, debugId = 'unknown') {
  try {
    console.log(`=== PROCESSING FACE [${debugId}] ===`);
    
    await ensureModelsLoaded();
    
    // Validate input buffer
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
      throw new Error('Invalid image buffer provided');
    }
    
    console.log(`[${debugId}] Image buffer size:`, imageBuffer.length, 'bytes');
    
    // Load image from buffer
    let image;
    try {
      image = await canvas.loadImage(imageBuffer);
      console.log(`[${debugId}] Image loaded. Dimensions:`, image.width, 'x', image.height);
      
      if (image.width < 50 || image.height < 50) {
        throw new Error('Image too small for face detection (minimum 50x50 pixels)');
      }
      
      if (image.width > 4000 || image.height > 4000) {
        throw new Error('Image too large for processing (maximum 4000x4000 pixels)');
      }
      
    } catch (imageError) {
      console.error('Failed to load image:', imageError);
      throw new Error(`Invalid image format: ${imageError.message}`);
    }

    // Configure detection options - more strict for better accuracy
    const options = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 416,
      scoreThreshold: 0.5 // Increased threshold for better quality
    });

    console.log(`[${debugId}] Starting face detection...`);

    // Detect single face with all features
    const detection = await faceapi
      .detectSingleFace(image, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected in the image. Please ensure your face is clearly visible and well-lit.');
    }

    console.log(`[${debugId}] Face detected with confidence:`, detection.detection.score.toFixed(4));

    if (!detection.descriptor || detection.descriptor.length !== 128) {
      throw new Error(`Invalid face descriptor generated. Expected 128 values, got ${detection.descriptor?.length || 0}`);
    }

    // Convert to regular array and validate
    const descriptorArray = Array.from(detection.descriptor);
    
    // Validate all values are valid numbers
    for (let i = 0; i < descriptorArray.length; i++) {
      const value = descriptorArray[i];
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        throw new Error(`Invalid descriptor value at index ${i}: ${value}`);
      }
    }

    const descriptorHash = generateDescriptorHash(descriptorArray);
    
    console.log(`[${debugId}] Face processing successful`);
    console.log(`[${debugId}] Detection confidence:`, detection.detection.score.toFixed(4));
    console.log(`[${debugId}] Descriptor hash:`, descriptorHash);
    console.log(`[${debugId}] Descriptor sample:`, descriptorArray.slice(0, 3).map(v => v.toFixed(4)));
    
    return {
      descriptor: descriptorArray,
      confidence: detection.detection.score,
      hash: descriptorHash,
      timestamp: new Date().toISOString(),
      debugId: debugId
    };

  } catch (error) {
    console.error(`❌ Error in processAndEncodeFace [${debugId}]:`, error.message);
    throw error;
  }
}

// Generate a consistent hash for descriptor debugging
function generateDescriptorHash(descriptor) {
  if (!Array.isArray(descriptor) || descriptor.length === 0) {
    return 'invalid';
  }
  
  // Use first 10 values for hash generation
  const sample = descriptor.slice(0, 10);
  let hash = 0;
  const str = sample.map(v => v.toFixed(6)).join(',');
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).substring(0, 8);
}

async function compareFace(imageBuffer, storedDescriptor, debugMode = true) {
  try {
    console.log('=== FACE COMPARISON START ===');
    console.log('Comparison timestamp:', new Date().toISOString());
    
    await ensureModelsLoaded();
    
    // Validate inputs
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
      throw new Error('Valid image buffer is required for face comparison');
    }
    
    if (!storedDescriptor) {
      throw new Error('Stored face descriptor is required for comparison');
    }

    console.log('=== STORED DESCRIPTOR VALIDATION ===');
    console.log('Stored descriptor type:', typeof storedDescriptor);
    console.log('Is array:', Array.isArray(storedDescriptor));
    
    // Handle different storage formats
    let actualDescriptor;
    let storedMetadata = {};
    
    if (Array.isArray(storedDescriptor)) {
      // Direct array format (your current format)
      actualDescriptor = storedDescriptor;
      console.log('✅ Using direct array format');
    } else if (storedDescriptor.descriptor && Array.isArray(storedDescriptor.descriptor)) {
      // Object with descriptor property
      actualDescriptor = storedDescriptor.descriptor;
      storedMetadata = {
        hash: storedDescriptor.hash,
        timestamp: storedDescriptor.timestamp,
        confidence: storedDescriptor.confidence
      };
      console.log('✅ Using object format with metadata');
    } else {
      throw new Error(`Unsupported stored descriptor format: ${typeof storedDescriptor}`);
    }
    
    // Validate stored descriptor using the validation function
    const validation = validateStoredFaceData(actualDescriptor);
    if (!validation.valid) {
      throw new Error(`Invalid stored face data: ${validation.error}`);
    }
    
    const storedHash = validation.hash;
    console.log('✅ Stored descriptor validation passed');
    console.log('Stored descriptor length:', actualDescriptor.length);
    console.log('Stored descriptor hash:', storedHash);
    console.log('Stored descriptor sample:', validation.sample.map(v => v.toFixed(4)));
    
    // Process the query image
    console.log('=== PROCESSING QUERY IMAGE ===');
    const queryResult = await processAndEncodeFace(imageBuffer, 'COMPARISON_QUERY');
    const queryDescriptor = queryResult.descriptor;
    const queryHash = queryResult.hash;
    
    console.log('Query descriptor hash:', queryHash);
    console.log('Query descriptor sample:', queryDescriptor.slice(0, 3).map(v => v.toFixed(4)));
    
    // Check if we're comparing identical descriptors (debugging issue)
    const sameDescriptor = storedHash === queryHash;
    if (sameDescriptor) {
      console.log('🚨 WARNING: Identical descriptor hashes detected!');
      console.log('This suggests the same image might be used for comparison');
    }
    
    // Convert to Float32Array for distance calculation
    const storedFloat32 = new Float32Array(actualDescriptor);
    const queryFloat32 = new Float32Array(queryDescriptor);
    
    // Calculate Euclidean distance
    console.log('=== CALCULATING DISTANCE ===');
    const distance = faceapi.euclideanDistance(queryFloat32, storedFloat32);
    
    console.log('Raw euclidean distance:', distance.toFixed(6));
    
    if (typeof distance !== 'number' || isNaN(distance) || !isFinite(distance)) {
      throw new Error(`Invalid distance calculation: ${distance}`);
    }
    
    // CRITICAL: More strict thresholds for security
    const EXCELLENT_THRESHOLD = 0.3;  // Very strict - same person, good conditions
    const GOOD_THRESHOLD = 0.4;       // Strict - same person, varying conditions  
    const ACCEPTABLE_THRESHOLD = 0.5; // Moderate - same person, poor conditions
    const POOR_THRESHOLD = 0.6;       // Loose - questionable match
    
    // Use strict threshold for security
    const threshold = GOOD_THRESHOLD;
    const isMatch = distance < threshold;
    
    // Calculate confidence (inverted distance, normalized)
    const confidence = Math.max(0, Math.min(1, (threshold - distance) / threshold));
    
    // Determine match quality
    let matchQuality;
    if (distance < EXCELLENT_THRESHOLD) {
      matchQuality = 'excellent';
    } else if (distance < GOOD_THRESHOLD) {
      matchQuality = 'good';
    } else if (distance < ACCEPTABLE_THRESHOLD) {
      matchQuality = 'acceptable';
    } else if (distance < POOR_THRESHOLD) {
      matchQuality = 'poor';
    } else {
      matchQuality = 'no_match';
    }
    
    // Additional security check: if confidence is too low, reject even if distance passes
    const minConfidenceThreshold = 0.3;
    const finalMatch = isMatch && confidence >= minConfidenceThreshold;
    
    const result = {
      match: finalMatch,
      distance: distance,
      threshold: threshold,
      confidence: confidence,
      matchQuality: matchQuality,
      storedHash: storedHash,
      queryHash: queryHash,
      sameDescriptor: sameDescriptor,
      timestamp: new Date().toISOString(),
      securityCheck: {
        distancePass: isMatch,
        confidencePass: confidence >= minConfidenceThreshold,
        finalResult: finalMatch
      },
      debug: debugMode ? {
        storedSample: actualDescriptor.slice(0, 3),
        querySample: queryDescriptor.slice(0, 3),
        queryConfidence: queryResult.confidence,
        storedMetadata: storedMetadata
      } : undefined
    };
    
    console.log('=== FACE COMPARISON RESULT ===');
    console.log('Distance:', result.distance.toFixed(6));
    console.log('Threshold:', result.threshold);
    console.log('Confidence:', (result.confidence * 100).toFixed(2) + '%');
    console.log('Match Quality:', result.matchQuality);
    console.log('Distance Pass:', result.securityCheck.distancePass);
    console.log('Confidence Pass:', result.securityCheck.confidencePass);
    console.log('FINAL MATCH:', result.match);
    console.log('Same Descriptor Warning:', result.sameDescriptor);
    console.log('=== FACE COMPARISON END ===');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error in compareFace:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Enhanced validation function
function validateStoredFaceData(faceData) {
  try {
    if (!faceData) {
      return { valid: false, error: 'Face data is null or undefined' };
    }
    
    let actualDescriptor;
    if (Array.isArray(faceData)) {
      actualDescriptor = faceData;
    } else if (faceData.descriptor && Array.isArray(faceData.descriptor)) {
      actualDescriptor = faceData.descriptor;
    } else {
      return { valid: false, error: 'Face data must be an array or object with descriptor array' };
    }
    
    if (actualDescriptor.length !== 128) {
      return { valid: false, error: `Face descriptor must have 128 values, got ${actualDescriptor.length}` };
    }
    
    let invalidCount = 0;
    for (let i = 0; i < actualDescriptor.length; i++) {
      const value = actualDescriptor[i];
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        invalidCount++;
      }
    }
    
    if (invalidCount > 0) {
      return { valid: false, error: `Face descriptor contains ${invalidCount} invalid values` };
    }
    
    return { 
      valid: true, 
      hash: generateDescriptorHash(actualDescriptor),
      length: actualDescriptor.length,
      sample: actualDescriptor.slice(0, 3)
    };
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

module.exports = {
  loadModels,
  processAndEncodeFace,
  compareFace,
  validateStoredFaceData,
  ensureModelsLoaded,
  generateDescriptorHash
};