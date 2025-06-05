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

const SettingsScreen = () => {
  const navigation = useNavigation();

  const settingsOptions = [
    'Profile Information',
    'Update Face Data',
    'Notification Setting',
    'Privacy Setting',
    'App Appearances',
    'About',
  ];

  const handleOptionPress = (option: string) => {
    console.log(`${option} pressed`);
    // Add navigation or action logic here
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    // Add logout logic here
  };

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Settings</Text>

      {/* Settings Options */}
      <View style={styles.optionsContainer}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleOptionPress(option)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Logout</Text>
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
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
    flex: 1,
  },
  optionButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default SettingsScreen;