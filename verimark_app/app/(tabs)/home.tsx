import React from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import StudentHomeScreen from '../screens/student/(tabs)/index';
import InstructorHomeScreen from '../screens/(instructor)/(tabs)';

export default function HomePage() {
  const { userRole } = useUserRole();
  
  if (userRole === 'student') {
    return <StudentHomeScreen title="Welcome Student" />;
  }
  
  return <InstructorHomeScreen title="Welcome Instructor" />;
}