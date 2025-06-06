import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { ThemeProvider } from '../ThemeContext'; // adjust path if needed

const RootLayout = () => {
  return (
    <ThemeProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="index"
          
        />
        <Stack.Screen
          name="auth/LoginScreen"
          
        />
        <Stack.Screen
          name="screens/student/StudentHomeScreen"
        
        />
        <Stack.Screen
          name="screens/(instructor)"/>
     
      
      </Stack>
    </ThemeProvider>
  );
}

export default RootLayout
