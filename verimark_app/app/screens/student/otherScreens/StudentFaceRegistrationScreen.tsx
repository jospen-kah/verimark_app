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
import { useMutation } from '@tanstack/react-query';

const FaceRegistrationScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

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
      Alert.alert(
        'Face Registration Error',
        error?.response?.data?.message || 'Could not register your face. Please try again.'
      );
    },
  });

  const handleTakePicture = async () => {
    if (!hasPermission) {
      Alert.alert('Permission required', 'Camera permission is required to register your face.');
      return;
    }
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, skipProcessing: true });
        mutation.mutate(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Could not take picture.');
        setLoading(false);
      }
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#777' }}>
          Camera permission is required to register your face.
        </Text>
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
        style={styles.captureButton}
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
    marginTop: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 40,
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
  instruction: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 24,
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    maxWidth: '80%',
    marginTop: 4,
  },
});

export default FaceRegistrationScreen;
