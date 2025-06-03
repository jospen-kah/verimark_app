import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FaceRegistrationScreen = () => {
  const navigation = useNavigation();

  const handleCameraPress = () => {
    // Add camera logic here
    console.log('Camera button pressed');
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
    paddingTop: 20,
  },
  backIcon: {
    position: 'absolute',
    left: 20,
    top: 20,
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