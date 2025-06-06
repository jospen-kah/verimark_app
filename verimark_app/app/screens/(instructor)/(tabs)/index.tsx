// screens/instructor/InstructorHomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '../../../../components/Header';
import ClassCard from '../../../../components/ClassCard';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

type InstructorHomeScreenProps = {
  title?: string;
};

const fetchInstructorProfile = async (instructorId: string) => {
  console.log('Fetching instructor profile for userId:', instructorId);
  const res = await axios.get(`http://192.168.1.187:3000/api/user/${instructorId}`);
  return res.data;
};

const fetchActiveSessions = async (instructorId: string) => {
  const res = await axios.get(`http://192.168.1.187:3000/api/attendance/active?instructorId=${instructorId}`);
  return res.data; // Should be an array of sessions
};

const InstructorHomeScreen: React.FC<InstructorHomeScreenProps> = ({ title }) => {
  const { theme } = useTheme();
  const [instructorId, setInstructorId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setInstructorId(storedUserId);
    };
    getUserId();
  }, []);

  const { data: instructorData, isLoading, error } = useQuery({
    queryKey: ['instructorProfile', instructorId],
    queryFn: () => fetchInstructorProfile(instructorId as string),
    enabled: !!instructorId,
  });

  // Fetch active attendance sessions for this instructor
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['activeSessions', instructorId],
    queryFn: () => fetchActiveSessions(instructorId as string),
    enabled: !!instructorId,
  });

  // Show loading spinner only while loading or waiting for instructorId
  if (!instructorId || isLoading || sessionsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={theme.text} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Failed to load profile.</Text>
      </View>
    );
  }

  const firstName = instructorData?.firstName || '';
  const lastName = instructorData?.lastName || '';
  const userTitle = instructorData?.title || '';
  const isApproved = instructorData?.isApproved;
  const name = `${userTitle} ${firstName} ${lastName}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name={name} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={[styles.header, { backgroundColor: theme.card }]}>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>{title ?? `Welcome ${name}`}</Text>
              <Text style={[styles.sub, { color: theme.text }]}>Manage classes, Track attendance</Text>
              {!isApproved && (
                <Text style={{ color: 'red', marginTop: 8, fontWeight: 'bold' }}>
                  Your account is not approved by admin. You cannot initiate attendance.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[
                styles.box,
                { backgroundColor: isApproved ? theme.card : '#ccc' },
                !isApproved && { opacity: 0.6 }
              ]}
              onPress={() => {
                if (isApproved) {
                  router.push('/screens/(instructor)/(tabs)/instructorCourseScreen');
                }
              }}
              disabled={!isApproved}
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

          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Active Sessions</Text>

          {/* Render a ClassCard for each active session */}
          {Array.isArray(sessions) && sessions.length > 0 ? (
            sessions.map((session: any) => (
              <TouchableOpacity
                key={session._id}
                onPress={() =>
                  router.push({
                    pathname: '/screens/(instructor)/otherScreens/ActiveAttendanceScreen',
                    params: {
                      sessionId: session._id,
                      selectedCourse: JSON.stringify(session.course),
                      selectedHall: JSON.stringify(session.hall),
                      startTime: session.startTime,
                      endTime: session.endTime,
                    },
                  })
                }
              >
                <ClassCard
                  title={session.course?.name || 'Course'}
                  time={`${session.startTime} - ${session.endTime}`}
                  hall={session.hall?.name || 'Hall'}
                  status={`Checked in: ${session.checkedInCount || 0}`}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: theme.text, textAlign: 'center', marginTop: 10 }}>
              No active sessions found.
            </Text>
          )}
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