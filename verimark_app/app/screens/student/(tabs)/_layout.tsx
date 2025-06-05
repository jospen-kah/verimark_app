import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Icon } from 'react-native-vector-icons/Icon';
export default function StudentTabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { /* your tab bar styling */ },
        }}

      >
        <Tabs.Screen name="index" options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />),
        }} />
        <Tabs.Screen name="studentAttendanceScreen" options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          )
        }} />
        <Tabs.Screen name="studentCourseScreen" options={{
          title: 'Course',
          tabBarIcon: ({ color }) => (
            <Feather name="book" size={24} color={color} />
          )
        }} />
        <Tabs.Screen name="studentProfileScreen" options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          )
        }} />
        <Tabs.Screen
          name="studentFaceRegistrationScreen"
          options={{
           href: null, // This will prevent the tab from being rendered in the tab bar,
          }}
        />

      </Tabs>
    </>
  );
}