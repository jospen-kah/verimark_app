import React, { useState, useEffect, useRef } from 'react';
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
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.187:3000/api'; // Your backend URL

const CheckInScreen = () => {
  const navigation = useNavigation();

  const [permission, requestPermission] = useCameraPermissions();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Waiting to start...');
  const [loading, setLoading] = useState(false);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{
    courseCode: string;
    courseName: string;
    hallName: string;
    startTime: string;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      // Request camera permission
      if (!permission?.granted) {
        await requestPermission();
      }
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus === 'granted');
    })();
  }, []);

  // Fetch active attendance session on mount
  useEffect(() => {
    async function loadActiveSession() {
      try {
        const response = await axios.get(`${API_BASE_URL}/open-sessions`, {
          withCredentials: true,
        });
        if (response.data.length > 0) {
          const session = response.data[0];
          setAttendanceId(session.attendanceId);
          setSessionInfo({
            courseCode: session.courseCode,
            courseName: session.courseName,
            hallName: session.hallName,
            startTime: session.startTime,
          });
        } else {
          Alert.alert('No active attendance session found.');
        }
      } catch (error) {
        Alert.alert('Failed to load attendance sessions.');
      }
    }
    loadActiveSession();
  }, []);

  const handleCheckIn = async () => {
    if (!attendanceId) {
      Alert.alert('No active attendance session to check into.');
      return;
    }

    setLoading(true);
    setStatusMessage('Fetching location...');

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 1. Verify geofence
      setStatusMessage('Verifying location in geofence...');
      const geoRes = await axios.post(
        `${API_BASE_URL}/verify-geofence`,
        {
          latitude,
          longitude,
          attendanceId,
        },
        { withCredentials: true }
      );

      if (!geoRes.data.inside) {
        Alert.alert('You are not inside the hall geofence.');
        setLoading(false);
        setStatusMessage('Waiting to start...');
        return;
      }

      // 2. Take picture for face verification
      setStatusMessage('Taking picture...');
      if (!cameraRef.current) {
        Alert.alert('Camera not available.');
        setLoading(false);
        setStatusMessage('Waiting to start...');
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: false });
      if (!photo.uri) {
        Alert.alert('Failed to take picture.');
        setLoading(false);
        setStatusMessage('Waiting to start...');
        return;
      }

      // 3. Submit face image and attendanceId for check-in
      setStatusMessage('Verifying face and checking in...');

      const formData = new FormData();
      formData.append('attendanceId', attendanceId);
      formData.append('faceImage', {
        uri: photo.uri,
        name: 'face.jpg',
        type: 'image/jpeg',
      } as any);

      const checkInRes = await axios.post(`${API_BASE_URL}/check-in`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (checkInRes.status === 200) {
        setStatusMessage('Check-in successful!');
        Alert.alert('Success', 'You have checked in successfully.');
      } else {
        Alert.alert('Check-in failed', checkInRes.data.message || 'Unknown error');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong.');
      setStatusMessage('Error during check-in');
    } finally {
      setLoading(false);
    }
  };

  if (!permission?.granted || !hasLocationPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          Camera and Location permissions are required to check in.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Class Check-in</Text>

      {sessionInfo ? (
        <View style={styles.classCard}>
          <Text style={styles.className}>{sessionInfo.courseCode} {sessionInfo.courseName}</Text>
          <Text style={styles.classTime}>{new Date(sessionInfo.startTime).toLocaleTimeString()}</Text>
          <Text style={styles.classLocation}>{sessionInfo.hallName}</Text>
          <Text style={styles.classStatus}>Ongoing</Text>
        </View>
      ) : (
        <Text style={{ marginBottom: 20 }}>Loading attendance session info...</Text>
      )}

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      </View>

      <Text style={styles.instruction}>Look directly at the camera</Text>
      <Text style={styles.statusText}>{statusMessage}</Text>

      <TouchableOpacity
        style={[styles.checkInButton, loading && { backgroundColor: '#ccc' }]}
        onPress={handleCheckIn}
        activeOpacity={0.8}
        disabled={loading || !attendanceId}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkInText}>Check In</Text>}
      </TouchableOpacity>
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
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 30,
  },
  classCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  classLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  classStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  cameraContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  camera: {
    flex: 1,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
  },
  checkInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  checkInText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CheckInScreen;
