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

interface ScreenProps {
  title?: string; // Optional title fallback
}

const ProfileScreen: React.FC<ScreenProps> = ({ title }) => {
  const name = "Michael Mitc";
  return (
<View>
    <Header name={name} />
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../../../assets/images/profile.jpg')}
        style={styles.profileImage}
      />
      <Text style={styles.name}>Michael Mitc</Text>
      <Text style={styles.info}>Matriculation: FE21A331</Text>
      <Text style={styles.info}>Computer Engineering L500</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Summary</Text>

        <SummaryCard label="Overall Attendance:" value="92%" valueColor="#2ECC71" />
        <SummaryCard label="Classes this Semester:" value="35/40" />
        <SummaryCard label="Late Check-ins:" value="3" valueColor="#E74C3C" />
      </View>

      <TouchableOpacity style={styles.settingsButton}
      onPress={()=> router.push('/screens/student/otherScreens/Studentsettings')}
      >
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
    color: '#777',
    marginTop: 2,
  },
  section: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  settingsButton: {
    marginTop: 24,
    backgroundColor: '#D8D8D8',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;