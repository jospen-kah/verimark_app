// screens/instructor/InstructorHomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../../../components/Header';
import ClassCard from '../../../../components/ClassCard';
import { router } from 'expo-router';

type InstructorHomeScreenProps = {
  title?: string;
};

const InstructorHomeScreen: React.FC<InstructorHomeScreenProps> = ({ title }) => {
  const name = "Dr. Johnson";
  
  return (
    <View style={styles.container}>
      <Header name={name} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{title ?? `Welcome ${name}`}</Text>
              <Text style={styles.sub}>Manage classes, Track attendance</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity 
              style={styles.box}
              onPress={() => router.push('/screens/(instructor)/(tabs)/instructorCourseScreen')}
            >
              <Text style={styles.boxText}>Initiate a Class</Text>
            </TouchableOpacity> 
            
          </View>

          <Text style={styles.sectionTitle}>My Classes</Text>

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
    backgroundColor: '#f6f8fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    padding: 15,
  },
  greeting: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  sub: { 
    color: '#d0e5ff' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#4f9dfc',
    borderRadius: 5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  box: {
    width: '100%',
    backgroundColor: '#418EFB',
    opacity:.2,
    padding: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  boxText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

export default InstructorHomeScreen;