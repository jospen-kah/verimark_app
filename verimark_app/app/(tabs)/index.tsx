import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Ensure this is installed

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/verimark-logo.png')}
        style={styles.image}
      />
      <ThemedText style={styles.header} type="title">
        Welcome to  VeriMark
      </ThemedText>

      {/* Floating icon for navigation */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/auth/LoginScreen')}>
        <Ionicons name="arrow-forward-circle" size={56} color="#fff" />
      </TouchableOpacity>
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
  },
  image: {
    width: 100,
    height: 100,
    
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 30,
  },
});
