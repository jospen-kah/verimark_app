import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StudentTabNavigator from '../app/(tabs)/_layout';  

export default function App() {
  return (
    <NavigationContainer>
      <StudentTabNavigator />
    </NavigationContainer>
  );
}