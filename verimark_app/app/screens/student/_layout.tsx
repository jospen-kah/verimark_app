import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ScreenLayout = () => {
  return <Stack screenOptions={{headerShown: false}}>
 
 <Stack.Screen
    name="(tabs)"
    options={{ title: 'tab' }}/>

  </Stack>
}

export default ScreenLayout
