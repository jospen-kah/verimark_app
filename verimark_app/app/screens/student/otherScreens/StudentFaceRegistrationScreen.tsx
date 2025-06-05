import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

const FaceRegistrationScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCameraPress = async () => {
    const permissionResult = await requestPermission();
    if (permissionResult.granted) {
      setShowCamera(true);
    } else {
      alert('Camera permission is required!');
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setShowCamera(false);
      // Send photo to backend for face recognition here
      router.push('/screens/student/otherScreens/FaceRegistrationSuccessScreen');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Face Registration</Text>
      <Text style={styles.subtitle}>Register your face to be able to mark attendance</Text>

      {/* Camera Icon */}
      <TouchableOpacity style={styles.cameraContainer} onPress={handleCameraPress}>
        <Ionicons name="camera" size={60} color="#007AFF" />
      </TouchableOpacity>

      {/* Camera Modal with Circular Preview */}
      <Modal visible={showCamera} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          {/* Circular Camera Preview */}
          <View
            style={{
              width: 320,
              height: 320,
              borderRadius: 160,
              overflow: 'hidden',
              borderWidth: 4,
              borderColor: '#007AFF',
              backgroundColor: '#000',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CameraView
              style={{ width: 320, height: 320 }}
              ref={cameraRef}
              facing="front"
            />
          </View>

          {/* Take Picture Button */}
          <TouchableOpacity
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 40,
            }}
            onPress={handleTakePicture}
          >
            <Ionicons name="camera" size={40} color="#007AFF" />
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, left: 20 }}
            onPress={() => setShowCamera(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Instructions */}
      <Text style={styles.instruction}>Click on the camera to start</Text>
      <Text style={styles.note}>Make sure your head is in the circle while we scan your face</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 0,
  },
  backIcon: {
    position: 'absolute',
    left: 20,
    paddingTop: StatusBar.currentHeight || 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 40,
  },
  cameraContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default FaceRegistrationScreen;
