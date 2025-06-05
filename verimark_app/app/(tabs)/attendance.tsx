import React from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import StudentAttendanceScreen from '../screens/student/(tabs)/studentAttendanceScreen';
import InstructorAttendanceScreen from '../screens/(instructor)/(tabs)/instructorAttendanceScreen';

export default function AttendancePage() {
  const { userRole } = useUserRole();
  
  if (userRole === 'student') {
    return <StudentAttendanceScreen />;
  }
  
    return <InstructorAttendanceScreen />;
  }