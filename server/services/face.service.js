const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_URL = path.join(__dirname, '../models/face_api_models');

async function loadModels() {
  try {
    console.log('Loading face-api models from:', MODEL_URL);
    
    // Load tinyFaceDetector instead of ssdMobilenetv1
    await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
    
    console.log('All face-api models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw new Error('Failed to load face recognition models');
  }
}

async function processAndEncodeFace(imageBuffer) {
  try {
    console.log('Starting face detection and encoding process');
    
    // Validate input buffer
    if (!imageBuffer) {
      throw new Error('Image buffer is undefined or null');
    }
    
    if (!Buffer.isBuffer(imageBuffer)) {
      throw new Error('Invalid image buffer type');
    }
    
    if (imageBuffer.length === 0) {
      throw new Error('Image buffer is empty');
    }
    
    console.log('Image buffer size:', imageBuffer.length);
    
    // Load image from buffer
    let image;
    try {
      image = await canvas.loadImage(imageBuffer);
      console.log('Image loaded successfully. Dimensions:', image.width, 'x', image.height);
    } catch (imageError) {
      console.error('Failed to load image:', imageError);
      throw new Error('Invalid image format or corrupted image data');
    }

    // Use tinyFaceDetector options with reasonable input size and score threshold
    const options = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 416, // Try smaller input size for better performance
      scoreThreshold: 0.3 // Lower threshold for better detection
    });

    console.log('Starting face detection with options:', options);

    // detectSingleFace returns single detection or null, NOT an array
    const detection = await faceapi
      .detectSingleFace(image, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    console.log('Face detection complete');
    console.log('Detection result:', detection ? 'Face found' : 'No face found');

    // Check if detection exists and has descriptor
    if (!detection) {
      throw new Error('No face detected in the image. Please ensure your face is clearly visible and well-lit.');
    }

    if (!detection.descriptor) {
      throw new Error('Failed to generate face descriptor from detected face');
    }

    console.log('Face descriptor generated successfully');
    console.log('Descriptor length:', detection.descriptor.length);
    
    return detection.descriptor;

  } catch (error) {
    console.error('Error in processAndEncodeFace:', error);
    throw error;
  }
}

async function compareFace(imageBuffer, storedDescriptor) {
  try {
    console.log('Starting face comparison');
    
    // Validate inputs
    if (!imageBuffer) {
      throw new Error('Image buffer is required for face comparison');
    }
    
    if (!storedDescriptor) {
      throw new Error('Stored face descriptor is required for comparison');
    }

    // Debug: Log the stored descriptor details
    console.log('Stored descriptor details:', {
      type: typeof storedDescriptor,
      isArray: Array.isArray(storedDescriptor),
      length: storedDescriptor?.length,
      constructor: storedDescriptor?.constructor?.name,
      hasData: storedDescriptor?.data ? 'yes' : 'no',
      firstFewValues: Array.isArray(storedDescriptor) ? storedDescriptor.slice(0, 5) : 'not array'
    });
    
    // Convert stored descriptor to Float32Array with better handling
    let storedDesc;
    
    if (Array.isArray(storedDescriptor)) {
      // Direct array
      if (storedDescriptor.length === 0) {
        throw new Error('Stored face descriptor array is empty');
      }
      storedDesc = new Float32Array(storedDescriptor);
    } else if (storedDescriptor.data && Array.isArray(storedDescriptor.data)) {
      // Handle case where descriptor might be wrapped in an object
      if (storedDescriptor.data.length === 0) {
        throw new Error('Stored face descriptor data array is empty');
      }
      storedDesc = new Float32Array(storedDescriptor.data);
    } else if (storedDescriptor instanceof Float32Array) {
      // Already a Float32Array
      storedDesc = storedDescriptor;
    } else if (typeof storedDescriptor === 'string') {
      // Handle string case (shouldn't happen with your schema but just in case)
      try {
        const parsed = JSON.parse(storedDescriptor);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Parsed descriptor is not a valid array');
        }
        storedDesc = new Float32Array(parsed);
      } catch (parseError) {
        throw new Error(`Failed to parse stored descriptor: ${parseError.message}`);
      }
    } else {
      throw new Error(`Unsupported stored descriptor format: ${typeof storedDescriptor}`);
    }
    
    // Final validation
    if (!storedDesc || storedDesc.length === 0) {
      throw new Error('Invalid stored face descriptor format after processing');
    }

    // Validate that all values are valid numbers
    for (let i = 0; i < storedDesc.length; i++) {
      if (typeof storedDesc[i] !== 'number' || isNaN(storedDesc[i])) {
        throw new Error(`Invalid number at index ${i}: ${storedDesc[i]}`);
      }
    }
    
    console.log('Processing new face image...');
    const queryDescriptor = await processAndEncodeFace(imageBuffer);
    
    if (!queryDescriptor) {
      throw new Error('Failed to process face from uploaded image');
    }
    
    console.log('Query descriptor length:', queryDescriptor.length);
    console.log('Stored descriptor length:', storedDesc.length);
    
    // Ensure both descriptors have the same length
    if (queryDescriptor.length !== storedDesc.length) {
      throw new Error(`Descriptor length mismatch: query=${queryDescriptor.length}, stored=${storedDesc.length}`);
    }
    
    const distance = faceapi.euclideanDistance(queryDescriptor, storedDesc);
    console.log('Euclidean distance:', distance);
    
    const threshold = 0.6;
    const match = distance < threshold;
    
    console.log(`Face match: ${match} (distance: ${distance}, threshold: ${threshold})`);
    
    return {
      match,
      distance,
      confidence: Math.max(0, 1 - distance)
    };
    
  } catch (error) {
    console.error('Error in compareFace:', error);
    throw error;
  }
}

// Alternative function using detectAllFaces if you want to detect multiple faces
async function processAndEncodeAllFaces(imageBuffer) {
  try {
    console.log('Starting multiple face detection process');
    
    // Validate input
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Invalid image buffer');
    }
    
    const image = await canvas.loadImage(imageBuffer);
    const options = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 416, 
      scoreThreshold: 0.3 
    });

    // detectAllFaces returns an array
    const detections = await faceapi
      .detectAllFaces(image, options)
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log(`Found ${detections.length} faces`);

    if (!detections || detections.length === 0) {
      throw new Error('No faces detected in the image');
    }

    // Return the first face's descriptor
    const firstFace = detections[0];
    if (!firstFace || !firstFace.descriptor) {
      throw new Error('Failed to generate face descriptor from detected face');
    }

    return firstFace.descriptor;

  } catch (error) {
    console.error('Error in processAndEncodeAllFaces:', error);
    throw error;
  }
}

module.exports = {
  loadModels,
  processAndEncodeFace,
  processAndEncodeAllFaces,
  compareFace,
};