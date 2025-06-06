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
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme context

const InstructorSettingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Map option to route
  const settingsOptions = [
    {
      label: 'Profile Information',
      route: '/screens/(instructor)/otherScreens/InstructorEditProfile',
    },
    {
      label: 'Notification Setting',
      route: '/screens/(instructor)/otherScreens/NotificationSetting',
    },
    {
      label: 'Privacy Setting',
      route: '/screens/(instructor)/otherScreens/PrivacySetting',
    },
    {
      label: 'App Appearances',
      route: '/screens/(instructor)/otherScreens/AppAppearance',
    },
    {
      label: 'About',
      route: '/screens/(instructor)/otherScreens/About',
    },
  ];

  const handleOptionPress = (route: string) => {
    router.push(route as any);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logout pressed');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      {/* Settings Options */}
      <View style={styles.optionsContainer}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, { backgroundColor: theme.card }]}
            onPress={() => handleOptionPress(option.route)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>{option.label}</Text>
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
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
    flex: 1,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
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

export default InstructorSettingsScreen;