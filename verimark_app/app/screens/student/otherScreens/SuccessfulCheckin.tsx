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

const CheckInSuccessfulScreen = () => {
  const navigation = useNavigation();

  const handleReturnHome = () => {
    console.log('Return to Home pressed');
    // Add navigation to home logic here
    // navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Check-in Successful</Text>

      {/* Success Circle with Checkmark */}
      <View style={styles.successContainer}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={60} color="#4CAF50" />
        </View>
      </View>

      {/* Class Info Card */}
      <View style={styles.classCard}>
        <Text style={styles.className}>CEF331 Advanced Database</Text>
        <Text style={styles.classTime}>10:00AM-12:00AM</Text>
        <Text style={styles.classLocation}>Hall BGFL</Text>
        <View style={styles.checkedInContainer}>
          <Ionicons name="checkmark" size={16} color="#4CAF50" />
          <Text style={styles.checkedInText}>Checked in at 10:02 AM</Text>
        </View>
      </View>

      {/* Return to Home Button */}
      <TouchableOpacity
        style={styles.returnButton}
        onPress={ () => router.push('/screens/student/(tabs)') }
        activeOpacity={0.8}
      >
        <Text style={styles.returnText}>Return to Home</Text>
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
    marginBottom: 50,
  },
  successContainer: {
    marginBottom: 50,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 80,
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
    marginBottom: 12,
  },
  checkedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedInText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 6,
  },
  returnButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  returnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CheckInSuccessfulScreen;