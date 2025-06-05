import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Icon } from 'react-native-vector-icons/Icon';
export default function InstructorTabLayout() {
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
        <Tabs.Screen name="instructorAttendanceScreen" options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          )
        }} />
        <Tabs.Screen name="instructorCourseScreen" options={{
          title: 'Course',
          tabBarIcon: ({ color }) => (
            <Feather name="book" size={24} color={color} />
          )
        }} />
        <Tabs.Screen name="instructorProfileScreen" options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          )
        }} />
      </Tabs>
      {/* <Tabs.Screen
        name="createSession"
        options={{
          href: null, // This will prevent the tab from being rendered in the tab bar
        }}
      /> */}
    </>
  );
}