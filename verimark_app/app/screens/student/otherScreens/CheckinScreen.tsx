import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const CheckInScreen = () => {
  const navigation = useNavigation();

  const handleCheckIn = () => {
    console.log('Check In pressed');
    // Add check-in logic here
  };

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Class Check-in</Text>

      {/* Class Info Card */}
      <View style={styles.classCard}>
        <Text style={styles.className}>CEF331 Advanced Database</Text>
        <Text style={styles.classTime}>10:00AM-12:00AM</Text>
        <Text style={styles.classLocation}>Hall BGFL</Text>
        <Text style={styles.classStatus}>Ongoing</Text>
      </View>

      {/* Camera Circle */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraCircle}>
          <View style={styles.innerCircle} />
        </View>
      </View>

      {/* Instructions */}
      <Text style={styles.instruction}>Look at directly Camera</Text>
      <Text style={styles.statusText}>Matching face...</Text>

      {/* Check In Button */}
      <TouchableOpacity
        style={styles.checkInButton}
        onPress={() => router.push('/screens/student/otherScreens/SuccessfulCheckin')}
        activeOpacity={0.8}
      >
        <Text style={styles.checkInText}>Check In</Text>
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
    marginBottom: 40,
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
    marginBottom: 40,
  },
  cameraCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#D3D3D3',
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
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CheckInScreen;