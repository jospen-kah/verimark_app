import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ScreenLayout = () => {
  return <Stack screenOptions={{headerShown: false}}>
 
 <Stack.Screen
    name="(instructor)"
    options={{ title: 'Home' }}/>
 <Stack.Screen
    name="student"/>
    
   
  </Stack>
}

export default ScreenLayout
