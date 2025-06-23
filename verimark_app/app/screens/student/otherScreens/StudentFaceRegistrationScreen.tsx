import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const checkFaceRegistrationStatus = async () => {
  const token = await SecureStore.getItemAsync('token');
  const res = await axios.get('http://192.168.1.172:3000/api/face/check-status', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const FaceRegistrationScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check face registration status
  const {
    data: faceStatus,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ['faceRegistrationStatus'],
    queryFn: checkFaceRegistrationStatus,
  });

  // Request permission on mount
  useEffect(() => {
    (async () => {
      const result = await requestPermission();
      setHasPermission(result.granted);
      if (!result.granted) {
        Alert.alert('Permission required', 'Camera permission is required to register your face.');
      }
    })();
  }, []);

  // Check if user should be redirected
  useEffect(() => {
    if (faceStatus && !statusLoading) {
      if (faceStatus.isRegistered) {
        const message = faceStatus.needsApproval 
          ? 'Your face is already registered. To update it, you need admin approval. Please contact your administrator.'
          : 'Your face is already registered and verified.';
        
        Alert.alert(
          'Face Already Registered',
          message,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    }
  }, [faceStatus, statusLoading]);

  const mutation = useMutation({
    mutationFn: async (photoUri: string) => {
      const token = await SecureStore.getItemAsync('token');
      const fileType = photoUri.split('.').pop() || 'jpg';

      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        type: `image/${fileType}`,
        name: `face.${fileType}`,
      } as any);

      return axios.post('http://192.168.1.172:3000/api/face/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      setLoading(false);
      router.push('/screens/student/otherScreens/FaceRegistrationSuccessScreen');
    },
    onError: (error: any) => {
      setLoading(false);
      console.error('Face registration failed:', error.response?.data || error.message);
      
      const errorMessage = error?.response?.data?.message || 'Could not register your face. Please try again.';
      
      // Handle specific error cases
      if (error?.response?.data?.isRegistered) {
        Alert.alert(
          'Face Already Registered',
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Face Registration Error', errorMessage);
      }
    },
  });

  const handleTakePicture = async () => {
    if (!hasPermission) {
      Alert.alert('Permission required', 'Camera permission is required to register your face.');
      return;
    }

    // Double-check registration status before proceeding
    if (faceStatus?.isRegistered) {
      Alert.alert(
        'Face Already Registered',
        'Your face is already registered. You cannot register again.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.7, 
          skipProcessing: true 
        });
        mutation.mutate(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Could not take picture.');
        setLoading(false);
      }
    }
  };

  // Show loading while checking status
  if (statusLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking registration status...</Text>
      </View>
    );
  }

  // Show error if status check failed
  if (statusError) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>Unable to check registration status</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prevent rendering if already registered
  if (faceStatus?.isRegistered) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Ionicons name="checkmark-circle" size={64} color="green" />
        <Text style={styles.alreadyRegisteredText}>Face Already Registered</Text>
        <Text style={styles.alreadyRegisteredSubText}>
          {faceStatus.needsApproval 
            ? 'Contact admin for updates' 
            : 'Your face is verified'}
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <Ionicons name="camera-outline" size={64} color="#ccc" />
          <Text style={styles.permissionText}>
            Camera permission is required to register your face.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={async () => {
              const result = await requestPermission();
              setHasPermission(result.granted);
            }}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Face Registration</Text>
      <Text style={styles.subtitle}>Register your face to be able to mark attendance</Text>

      {/* Circular Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing="front"
        />
      </View>

      {/* Take Picture Button */}
      <TouchableOpacity
        style={[styles.captureButton, loading && styles.captureButtonDisabled]}
        onPress={handleTakePicture}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Ionicons name="camera" size={40} color="#007AFF" />
        )}
      </TouchableOpacity>

      {/* Instructions */}
      <Text style={styles.instruction}>Make sure your head is inside the circle</Text>
      <Text style={styles.note}>Press the camera button to capture your face</Text>
      
      {/* Warning about one-time registration */}
      <View style={styles.warningContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#ff9500" />
        <Text style={styles.warningText}>
          You can only register your face once. Admin approval is required for updates.
        </Text>
      </View>
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
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  cameraContainer: {
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#007AFF',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: 320,
    height: 320,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  instruction: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 24,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    maxWidth: '80%',
    marginTop: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff5f0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9500',
    maxWidth: '90%',
  },
  warningText: {
    marginLeft: 8,
    fontSize: 11,
    color: '#d86200',
    flex: 1,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  alreadyRegisteredText: {
    marginTop: 15,
    fontSize: 18,
    color: 'green',
    textAlign: 'center',
    fontWeight: '600',
  },
  alreadyRegisteredSubText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  permissionText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FaceRegistrationScreen;