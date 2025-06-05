import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const RootLayout = () => {
  return <Stack screenOptions={{headerShown: false}}>
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
}

export default RootLayout
