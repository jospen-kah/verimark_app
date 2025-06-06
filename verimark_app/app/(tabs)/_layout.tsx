import { Tabs } from 'expo-router';
import { useUserRole } from '../../hooks/useUserRole';
import CustomTabBarComponent from '../../components/ui/CustomTabBar';
import { useTheme } from '../../ThemeContext'; // <-- Import the theme
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface CustomTabBarProps extends BottomTabBarProps {
  userRole: string;
  theme: {
    background: string;
    text: string;
    card: string;
  };
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ userRole, theme, ...props }) => {
  // Pass only the props expected by CustomTabBarComponent
  return <CustomTabBarComponent {...props} userRole={userRole} />;
};

export default function TabLayout() {
  const { userRole } = useUserRole();
  const { theme } = useTheme(); // <-- Use the theme

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card, // Use theme color
          borderTopColor: theme.text + '22', // Optional: subtle border
        },
        tabBarActiveTintColor: theme.text, // Active icon/text color
        tabBarInactiveTintColor: theme.text + '99', // Inactive icon/text color
      }}
      tabBar={(props) => <CustomTabBar {...props} userRole={userRole} theme={theme} />} // Pass theme if needed
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Tabs.Screen name="course" options={{ title: 'Course' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}