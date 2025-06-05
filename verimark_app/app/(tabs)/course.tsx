import React from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import StudentCourseScreen from '../screens/student/(tabs)/studentCourseScreen';
import InstructorCourseScreen from '../screens/(instructor)/(tabs)/instructorCourseScreen';

export default function CoursePage() {
  const { userRole } = useUserRole();
  
  if (userRole === 'student') {
    return <StudentCourseScreen />;
  }
  
  return <InstructorCourseScreen />;
}