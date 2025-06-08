const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_URL = path.join(__dirname, '../models/face_api_models');

async function loadModels() {
  // Load tinyFaceDetector instead of ssdMobilenetv1
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
}

async function processAndEncodeFace(imageBuffer) {
  const image = await canvas.loadImage(imageBuffer);

  // Use tinyFaceDetector options with reasonable input size and score threshold
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });

  const detection = await faceapi
    .detectSingleFace(image, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  console.log('Detection:', detection);

  if (!detection) throw new Error('No face detected');
  return detection.descriptor;
}

async function compareFace(imageBuffer, storedDescriptor) {
  const queryDescriptor = await processAndEncodeFace(imageBuffer);
  const distance = faceapi.euclideanDistance(queryDescriptor, storedDescriptor);
  const match = distance < 0.6;
  return match;
}

module.exports = {
  loadModels,
  processAndEncodeFace,
  compareFace,
};
