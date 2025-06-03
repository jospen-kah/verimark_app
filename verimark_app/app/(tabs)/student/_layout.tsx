import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack initialRouteName="FaceRegistrationScreen">
      <Stack.Screen
        name="FaceRegistrationScreen"
        options={{ title: 'Face Registration' }}
      />
      <Stack.Screen
        name="AttendanceScreen"
        options={{ title: 'Attendance' }}
      />
    </Stack>
  );
}