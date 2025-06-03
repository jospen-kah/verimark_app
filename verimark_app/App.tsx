import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StudentTabNavigator from './app/student/(tabs)/StudentTabNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StudentTabNavigator />
    </NavigationContainer>
  );
}
