import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../../../components/Header';
import ClassCard from '../../../../components/ClassCard';
import { router } from 'expo-router';

type HomeScreenProps = {
  title?: string;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ title }) => {
  const name = "Michael Mitc";
  return (
    <View style={styles.container}>
      <Header name={name} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{title ?? `Welcome ${name}`}</Text>
              <Text style={styles.sub}>Check-in smarter, Learn Better</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity style={styles.box}
              onPress={() => router.push('/student/screens/FaceRegistrationScreen')}
                >
              <Text style={styles.boxText}>Face Registration</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            onPress={() => router.push('/')}
            style={styles.box}>
              <Text style={styles.boxText}>History</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Today’s Classes</Text>

          <ClassCard
            title="CEF331 Advanced Database"
            time="10:00AM-12:00AM"
            hall="BGFL"
            status="Active"
          />
          <ClassCard
            title="CEF521 Software Engineering"
            time="13:00PM-15:00PM"
            hall="BGFL"
            status="Upcoming"
          />
          <ClassCard
            title="CEF521 Software Engineering"
            time="13:00PM-15:00PM"
            hall="BGFL"
            status="Upcoming"
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
  greeting: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sub: { color: '#d0e5ff' },
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
    width: '49%',
    backgroundColor: '#fff',
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
    color: '#4f9dfc',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

export default HomeScreen;