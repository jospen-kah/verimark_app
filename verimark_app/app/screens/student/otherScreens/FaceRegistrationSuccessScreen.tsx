import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const FaceRegistrationSuccessScreen = () => {
  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Face Registration</Text>

      {/* User Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/images/profile.jpg')}
          style={styles.image}
        />
      </View>

      {/* Success Icon and Text */}
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={64} color="green" />
        <Text style={styles.successText}>Successful</Text>
      </View>

      {/* Return to Home Button */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push('/screens/student/(tabs)')}
      >
        <Text style={styles.homeButtonText}>Return to Home</Text>
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
    paddingTop: StatusBar.currentHeight || 40,
  },
  backIcon: {
    position: 'absolute',
    top: StatusBar.currentHeight || 40,
    left: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 10,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#007AFF',
    overflow: 'hidden',
    marginTop: 50,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  successContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  successText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: 'green',
  },
  homeButton: {
    marginTop: 40,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FaceRegistrationSuccessScreen;
