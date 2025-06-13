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
    console.log('Image buffer size:', imageBuffer.length);
    
    // Load image from buffer
    const image = await canvas.loadImage(imageBuffer);
    console.log('Image loaded successfully. Dimensions:', image.width, 'x', image.height);

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
      throw new Error('No face detected in the image');
    }

    if (!detection.descriptor) {
      throw new Error('Failed to generate face descriptor');
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
    
    // Convert stored descriptor to Float32Array if it's an array
    let storedDesc = storedDescriptor;
    if (Array.isArray(storedDescriptor)) {
      storedDesc = new Float32Array(storedDescriptor);
    }
    
    const queryDescriptor = await processAndEncodeFace(imageBuffer);
    
    if (!queryDescriptor || !storedDesc) {
      throw new Error('Invalid descriptors for comparison');
    }
    
    console.log('Query descriptor length:', queryDescriptor.length);
    console.log('Stored descriptor length:', storedDesc.length);
    
    const distance = faceapi.euclideanDistance(queryDescriptor, storedDesc);
    console.log('Euclidean distance:', distance);
    
    const threshold = 0.6;
    const match = distance < threshold;
    
    console.log(`Face match: ${match} (distance: ${distance}, threshold: ${threshold})`);
    
    return {
      match,
      distance,
      confidence: 1 - distance // Higher confidence for lower distance
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

    if (detections.length === 0) {
      throw new Error('No faces detected in the image');
    }

    // Return the first face's descriptor
    const firstFace = detections[0];
    if (!firstFace || !firstFace.descriptor) {
      throw new Error('Failed to generate face descriptor');
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