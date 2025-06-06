import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext'; // <-- Import the theme context

type HeaderProps = {
  name: string;
};

const Header: React.FC<HeaderProps> = ({ name }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View>
        <Image source={require('../assets/images/verimark-logo-2.png')} style={styles.logo} />
      </View>
      <View style={styles.rightSection}>
        {/* Notification Icon */}
        <TouchableOpacity onPress={() => console.log('Notifications')}>
          <Ionicons name="notifications-outline" size={25} color={theme.text} />
        </TouchableOpacity>
        <Image source={require('../assets/images/profile.jpg')} style={styles.avatar} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 30,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  logo: { width: 50, height: 50 }
});

export default Header;
