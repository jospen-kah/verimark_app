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
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.1.107:3000/api'; // Your backend URL

const CheckInScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [permission, requestPermission] = useCameraPermissions();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading session...');
  const [loading, setLoading] = useState(false);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{
    courseCode: string;
    courseName: string;
    hallName: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);

  // Function to get authentication token from SecureStore
  const getAuthToken = async () => {
    try {
      // Common SecureStore keys for tokens - adjust as needed
      let token = await SecureStore.getItemAsync('token') || 
                 await SecureStore.getItemAsync('authToken') || 
                 await SecureStore.getItemAsync('accessToken') ||
                 await SecureStore.getItemAsync('userToken') ||
                 await SecureStore.getItemAsync('jwt');
      
      console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
      
      return token;
    } catch (error) {
      console.error('Error getting auth token from SecureStore:', error);
      return null;
    }
  };

  // Function to handle authentication errors
  const handleAuthError = () => {
    Alert.alert(
      'Authentication Required',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login screen - adjust route name as needed
            navigation.navigate('Login' as never);
          },
        },
      ]
    );
  };

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

  // Get attendanceId from route params and fetch session details
  useEffect(() => {
    const getAttendanceId = () => {
      // Get attendanceId from route params
      const params = route.params as { attendanceId?: string } | undefined;
      const paramAttendanceId = params?.attendanceId;
      
      console.log('Route params:', params); // Debug log
      
      if (paramAttendanceId) {
        console.log('Found attendanceId:', paramAttendanceId); // Debug log
        setAttendanceId(paramAttendanceId);
        fetchSessionDetails(paramAttendanceId);
      } else {
        // Alternative way to get attendanceId from URL-like params
        try {
          // For expo-router, params might be in route.params directly
          const routeParams = route.params as any;
          if (routeParams && typeof routeParams === 'object') {
            const keys = Object.keys(routeParams);
            const attendanceIdKey = keys.find(key => key.includes('attendanceId'));
            if (attendanceIdKey) {
              const id = routeParams[attendanceIdKey];
              if (id) {
                console.log('Found attendanceId from alternative method:', id); // Debug log
                setAttendanceId(id);
                fetchSessionDetails(id);
                return;
              }
            }
          }
        } catch (error) {
          console.log('Error parsing route params:', error);
        }
        
        Alert.alert('Error', 'No attendance session specified.');
        setStatusMessage('No session specified');
        setTimeout(() => navigation.goBack(), 1000);
      }
    };

    getAttendanceId();
  }, [route]);

const fetchSessionDetails = async (sessionAttendanceId: string) => {
  try {
    setStatusMessage('Loading session details...');
    console.log('Fetching session for ID:', sessionAttendanceId);
    
    const token = await getAuthToken();
    if (!token) {
      handleAuthError();
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/attendance/session/${sessionAttendanceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 15000, // Increased timeout
    });

    console.log('Full API response:', response.data);

    const sessionData = response.data.success ? response.data.data : response.data;
    
    if (sessionData) {
      console.log('Session data:', sessionData);
      
      // Check if session is still active (optional client-side validation)
      const now = new Date();
      const endTime = new Date(sessionData.endTime);
      
      if (now > endTime) {
        Alert.alert(
          'Session Expired', 
          'This attendance session has already ended. Please contact your instructor if you need assistance.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
        setStatusMessage('Session has expired');
        return;
      }
      
      setSessionInfo({
        courseCode: sessionData.courseCode || 'N/A',
        courseName: sessionData.courseName || 'Unknown Course',
        hallName: sessionData.hallName || 'Unknown Hall',
        startTime: sessionData.startTime || '',
        endTime: sessionData.endTime || '',
      });
      setStatusMessage('Session loaded successfully. Ready to check in.');
    } else {
      console.log('No session data found in response');
      Alert.alert('Error', 'Session not found.');
      setStatusMessage('Session not found');
      setTimeout(() => navigation.goBack(), 1000);
    }
  } catch (err: unknown) {
    console.error('Error loading session details:', err);
    
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      const debugInfo = err.response?.data?.debug;
      
      console.log('Axios error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage
      });
      
      // Handle different error scenarios
      switch (err.response?.status) {
        case 401:
          handleAuthError();
          return;
          
        case 403:
          Alert.alert('Access Denied', 'You do not have permission to access this resource.');
          break;
          
        case 404:
          Alert.alert('Session Not Found', 'The attendance session could not be found or may have been deleted.');
          break;
          
        case 400:
          // Handle session expiry specifically
          if (errorMessage.includes('ended') || errorMessage.includes('expired')) {
            const timeInfo = debugInfo ? 
              `\n\nSession ended at: ${new Date(debugInfo.endTime).toLocaleString()}` : '';
            
            Alert.alert(
              'Session Unavailable', 
              `This attendance session has ended and is no longer accepting check-ins.${timeInfo}`,
              [
                {
                  text: 'Contact Instructor',
                  onPress: () => {
                    // You could add logic here to show instructor contact info
                    Alert.alert('Contact Info', 'Please reach out to your course instructor for assistance with late attendance.');
                  }
                },
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                  style: 'default'
                }
              ]
            );
          } else {
            Alert.alert('Session Error', errorMessage);
          }
          break;
          
        case 500:
          Alert.alert('Server Error', 'There was a problem with the server. Please try again later.');
          break;
          
        default:
          Alert.alert('Connection Error', `Failed to load session: ${errorMessage}`);
      }
    } else {
      console.log('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please check your internet connection and try again.');
    }
    
    setStatusMessage('Failed to load session');
    setTimeout(() => navigation.goBack(), 3000);
  }
};

// Helper function to check session status before attempting to fetch
const checkSessionStatus = async (sessionId: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    // Quick status check endpoint (if you have one)
    const response = await axios.head(`${API_BASE_URL}/attendance/session/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000,
    });
    
    return response.status === 200;
  } catch {
    return false;
  }
};

// Enhanced session validation
const validateSessionTiming = (startTime: string, endTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now < start) {
    return { valid: false, reason: 'not_started', message: 'Session has not started yet' };
  }
  
  if (now > end) {
    return { valid: false, reason: 'expired', message: 'Session has ended' };
  }
  
  // Check if session is ending soon (within 5 minutes)
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  const isEndingSoon = fiveMinutesFromNow > end;
  
  return { 
    valid: true, 
    reason: isEndingSoon ? 'ending_soon' : 'active',
    message: isEndingSoon ? 'Session ending soon' : 'Session active'
  };
};


 const handleCheckIn = async () => {
  if (!attendanceId) {
    Alert.alert('Error', 'No active attendance session to check into.');
    return;
  }

  setLoading(true);
  setStatusMessage('Fetching location...');

  try {
    const token = await getAuthToken();
    if (!token) {
      handleAuthError();
      setLoading(false);
      return;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;

    console.log('Current location:', { latitude, longitude });

    // 1. Verify geofence
    setStatusMessage('Verifying location in geofence...');
    const geoRes = await axios.post(
      `${API_BASE_URL}/attendance/verify-geofence`,
      {
        latitude,
        longitude,
        attendanceId,
      },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 15000,
      }
    );

    console.log('Geofence response:', geoRes.data);

    if (!geoRes.data.inside) {
      Alert.alert('Location Error', 'You are not inside the required location for this class.');
      setLoading(false);
      setStatusMessage('Location verification failed');
      return;
    }

    // 2. Take picture for face verification
    setStatusMessage('Taking picture...');
    if (!cameraRef.current) {
      Alert.alert('Camera Error', 'Camera not available.');
      setLoading(false);
      setStatusMessage('Camera unavailable');
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({ 
      quality: 0.7, 
      base64: false,
      skipProcessing: true,
    });
    
    if (!photo.uri) {
      Alert.alert('Camera Error', 'Failed to take picture.');
      setLoading(false);
      setStatusMessage('Photo capture failed');
      return;
    }

    console.log('Photo taken:', photo.uri);

    // 3. Submit face image, coordinates, and attendanceId for check-in
    setStatusMessage('Verifying face and checking in...');

    const formData = new FormData();
    formData.append('attendanceId', attendanceId);
    // 🔥 FIX: Add the missing coordinates to FormData
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('faceImage', {
      uri: photo.uri,
      name: 'face.jpg',
      type: 'image/jpeg',
    } as any);

    // Debug FormData contents
    console.log('=== FORMDATA DEBUG ===');
    console.log('FormData contents:');
    console.log('- attendanceId:', attendanceId);
    console.log('- latitude:', latitude);
    console.log('- longitude:', longitude);
    console.log('- faceImage URI:', photo.uri);
    console.log('=== END FORMDATA DEBUG ===');

    const checkInRes = await axios.post(`${API_BASE_URL}/attendance/check-in`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 30000, // 30 second timeout for face verification
    });

    console.log('Check-in response:', checkInRes.data);

    if (checkInRes.status === 200) {
      setStatusMessage('Check-in successful!');
      Alert.alert('Success', 'You have checked in successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      const errorMessage = checkInRes.data.message || 'Check-in failed for unknown reason';
      Alert.alert('Check-in Failed', errorMessage);
      setStatusMessage('Check-in failed');
    }
  } catch (error: any) {
    console.error('Check-in error:', error);
    
    let errorMessage = 'Something went wrong during check-in';
    
    if (axios.isAxiosError(error)) {
      console.log('Check-in error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        handleAuthError();
        setLoading(false);
        return;
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid request data';
        // Log detailed error for debugging
        console.log('400 Error details:', error.response.data);
      } else if (error.response?.status === 403) {
        errorMessage = error.response.data.message || 'Access denied';
      } else if (error.response?.status === 404) {
        errorMessage = 'Attendance session not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert('Check-in Error', errorMessage);
    setStatusMessage('Check-in error occurred');
  } finally {
    setLoading(false);
  }
};

  if (!permission?.granted || !hasLocationPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera and Location permissions are required to check in.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={async () => {
            if (!permission?.granted) {
              await requestPermission();
            }
            if (!hasLocationPermission) {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setHasLocationPermission(status === 'granted');
            }
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
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
          <Text style={styles.className}>
            {`${sessionInfo.courseCode || 'N/A'} - ${sessionInfo.courseName || 'Unknown Course'}`}
          </Text>
          <Text style={styles.classTime}>
            {sessionInfo.startTime ? new Date(sessionInfo.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) : 'N/A'} - {sessionInfo.endTime ? new Date(sessionInfo.endTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) : 'N/A'}
          </Text>
          <Text style={styles.classLocation}>📍 {sessionInfo.hallName || 'Unknown Hall'}</Text>
          <Text style={styles.classStatus}>🟢 Active</Text>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading attendance session...</Text>
        </View>
      )}

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      </View>

      <Text style={styles.instruction}>Look directly at the camera</Text>
      <Text style={styles.statusText}>{statusMessage}</Text>

      <TouchableOpacity
        style={[
          styles.checkInButton,
          (loading || !attendanceId || !sessionInfo) && styles.checkInButtonDisabled
        ]}
        onPress={handleCheckIn}
        activeOpacity={0.8}
        disabled={loading || !attendanceId || !sessionInfo}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkInText}>Check In</Text>
        )}
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
    top: (StatusBar.currentHeight || 0) + 10,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 30,
    marginTop: 40,
  },
  classCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  classLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  classStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    width: '100%',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  cameraContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 3,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  camera: {
    flex: 1,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  checkInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  checkInButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkInText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  permissionText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CheckInScreen;