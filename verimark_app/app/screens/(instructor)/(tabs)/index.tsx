// screens/instructor/InstructorHomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../../../components/Header';
import ClassCard from '../../../../components/ClassCard';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme context

type InstructorHomeScreenProps = {
  title?: string;
};

const InstructorHomeScreen: React.FC<InstructorHomeScreenProps> = ({ title }) => {
  const name = "Dr. Johnson";
  const { theme } = useTheme(); // <-- Use the theme

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name={name} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={[styles.header, { backgroundColor: theme.card }]}>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>{title ?? `Welcome ${name}`}</Text>
              <Text style={[styles.sub, { color: theme.text } ]}>Manage classes, Track attendance</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity 
              style={[styles.box, { backgroundColor: theme.card }]}
              onPress={() => router.push('/screens/(instructor)/(tabs)/instructorCourseScreen')}
            >
              <Text style={[styles.boxText, { color: theme.text }]}>Initiate a Class</Text>
            </TouchableOpacity> 

            <TouchableOpacity
              style={[styles.box, { marginLeft: 10, backgroundColor: theme.card }]}
              onPress={() => router.push('/screens/(instructor)/otherScreens/Report')}
            >
              <Text style={[styles.boxText, { color: theme.text }]}>Download Reports</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Classes</Text>

          <ClassCard
            title="CEF331 Advanced Database"
            time="10:00AM-12:00AM"
            hall="BGFL"
            status="Teaching Now"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    padding: 15,
  },
  greeting: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  sub: { 
    // color will be set by theme
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  box: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  boxText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

export default InstructorHomeScreen;