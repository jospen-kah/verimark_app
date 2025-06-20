import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function WelcomeScreen() {
  const router = useRouter();

  const checkTokenAndNavigate = async () => {
    try {
      // Get token and user data from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (!token || !userData) {
        // No token or user data found, redirect to login
        router.replace('/auth/LoginScreen');
        return;
      }

      // Parse user data
      const user = JSON.parse(userData);
      
      // Check if token is expired
      const tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
      if (tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        const currentDate = new Date();
        
        if (currentDate >= expiryDate) {
          // Token is expired, clear storage and redirect to login
          await AsyncStorage.multiRemove(['authToken', 'userData', 'tokenExpiry']);
          router.replace('/auth/LoginScreen');
          return;
        }
      }

      // Token is valid, route based on user role
      if (user.role === 'student' || user.userType === 'student') {
        router.replace('/screens/student/(tabs)');
      } else if (user.role === 'instructor' || user.userType === 'instructor') {
        router.replace('/screens/(instructor)/(tabs)');
      } else {
        // Unknown role, redirect to login
        router.replace('/auth/LoginScreen');
      }

    } catch (error) {
      console.error('Error checking authentication:', error);
      // On error, redirect to login
      router.replace('/auth/LoginScreen');
    }
  };

  useEffect(() => {
    // Add a small delay to show the welcome screen briefly
    const timer = setTimeout(() => {
      checkTokenAndNavigate();
    }, 1500); // 1.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/verimark-logo.png')}
        style={styles.image}
      />
      <ThemedText style={styles.header} type="title">
       Welcome to VeriMark
      </ThemedText>
      
      {/* Optional loading indicator */}
      <ThemedText style={styles.loadingText}>
        Loading...
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3085FE',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
    marginTop: 20,
  },
});