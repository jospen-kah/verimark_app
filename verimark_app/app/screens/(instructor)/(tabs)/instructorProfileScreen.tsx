import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import SummaryCard from '../../../../components/SummaryCard';
import Header from '../../../../components/Header';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme context

const InstructorProfileScreen = () => {
  const name = "Michael Mitc";
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header name={name} />
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <Image
          source={require('../../../../assets/images/profile.jpg')}
          style={styles.profileImage}
        />
        <Text style={[styles.name, { color: theme.text }]}>Dr Johnson </Text>
        <Text style={[styles.info, { color: theme.text + '99' }]}>Email: johnson@gmail.com</Text>

        <View style={[styles.section, { backgroundColor: theme.card, borderRadius: 12 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Attendance Summary</Text>
          <SummaryCard label="Overall Attendance:" value="92%" valueColor="#2ECC71" />
          <SummaryCard label="Classes this Semester:" value="35/40" />
          <SummaryCard label="Late Check-ins:" value="3" valueColor="#E74C3C" />
        </View>

        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.card }]}
          onPress={() => router.push('/screens/(instructor)/otherScreens/InstructorSetting')}
        >
          <Text style={[styles.settingsText, { color: theme.text }]}>Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    flexGrow: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    marginTop: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    width: '100%',
    marginTop: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  settingsButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default InstructorProfileScreen;