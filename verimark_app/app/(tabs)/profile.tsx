import React from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import StudentProfileScreen from '../screens/student/(tabs)/studentProfileScreen';
import InstructorProfileScreen from '../screens/(instructor)/(tabs)/instructorProfileScreen';

export default function ProfilePage() {
  const { userRole } = useUserRole();
  
  if (userRole === 'student') {
    return <StudentProfileScreen />;
  }
  
  return <InstructorProfileScreen />;
}