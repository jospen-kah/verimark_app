import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Header from '../../../../components/Header';
import ClassCard from '../../../../components/ClassCard';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

type StudentHomeScreenProps = {
  title?: string;
};

const fetchStudentProfile = async (studentId: string) => {
  console.log('Fetching student profile for userId:', studentId);
  const res = await axios.get(`http://192.168.1.172:3000/api/user/${studentId}`);
  return res.data;
};

const fetchOpenAttendances = async () => {
  const token = await SecureStore.getItemAsync('token');
  const res = await axios.get('http://192.168.1.172:3000/api/attendance/open-sessions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({ title }) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setStudentId(storedUserId);
    };
    getUserId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: ['studentProfile', studentId] });
        queryClient.invalidateQueries({ queryKey: ['openAttendances'] });
      }
    }, [queryClient, studentId])
  );

  const {
    data: studentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['studentProfile', studentId],
    queryFn: () => fetchStudentProfile(studentId as string),
    enabled: !!studentId,
  });

  const {
    data: openSessions,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['openAttendances'],
    queryFn: fetchOpenAttendances,
    enabled: !!studentId,
  });

  if (!studentId || isLoading || sessionsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={theme.text} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading student profile</Text>
      </View>
    );
  }

  const firstName = studentData?.firstName || 'Student';
  const lastName = studentData?.lastName || '';
  const matricule = studentData?.matriNumber || '';
  const name = `${firstName} ${lastName}`;

  // Filter sessions by search text (course code or name)
  const filteredSessions = openSessions?.filter((session: any) => {
    const searchLower = searchText.toLowerCase();
    return (
      session.courseCode.toLowerCase().includes(searchLower) ||
      session.courseName.toLowerCase().includes(searchLower) ||
      session.hallName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <View style={styles.container}>
      <Header name={name} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{title ?? `Welcome ${name}`}</Text>
              <Text style={styles.sub}> Matricule: {matricule}</Text>
              <Text style={styles.sub}>Check-in smarter, Learn Better</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.box}
              onPress={() => router.push('/screens/student/otherScreens/StudentFaceRegistrationScreen')}
            >
              <Text style={styles.boxText}>Face Registration</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/screens/student/(tabs)/studentAttendanceScreen')}
              style={styles.box}
            >
              <Text style={styles.boxText}>Attendance</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Today's Active Sessions</Text>

          <TextInput
            placeholder="Search classes by code, name or hall..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />

          {filteredSessions && filteredSessions.length > 0 ? (
            filteredSessions.map((session: any) => (
              <TouchableOpacity
                key={session.attendanceId}
                onPress={() =>
                  router.push(
                    `/screens/student/otherScreens/CheckinScreen?attendanceId=${session.attendanceId}`
                  )
                }
              >
                <ClassCard
                  title={`${session.courseCode} ${session.courseName}`}
                  time={`${new Date(session.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} - ${new Date(session.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}


                  hall={session.hallName}
                  status="Active"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noSessionText}>No active sessions found.</Text>
          )}
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
    fontWeight: 'bold',
  },
  sub: {
    color: '#d0e5ff',
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
  searchInput: {
    height: 40,
    borderColor: '#4f9dfc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  noSessionText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default StudentHomeScreen;
