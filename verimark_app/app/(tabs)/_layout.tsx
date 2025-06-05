import { Tabs } from 'expo-router';
import { useUserRole } from '../../hooks/useUserRole';
import CustomTabBar from '../../components/ui/CustomTabBar';

export default function TabLayout() {
  const { userRole } = useUserRole();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { /* your tab bar styling */ },
      }}
      tabBar={(props) => <CustomTabBar {...props} userRole={userRole} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Tabs.Screen name="course" options={{ title: 'Course' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}