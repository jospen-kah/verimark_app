import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../ThemeContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';

const ActiveAttendanceScreen = () => {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const selectedCourse = params.selectedCourse ? JSON.parse(params.selectedCourse as string) : null;
  const selectedHall = params.selectedHall ? JSON.parse(params.selectedHall as string) : null;
  const startTime = params.startTime as string;
  const endTime = params.endTime as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [sessionActive, setSessionActive] = useState(true);
  const [remainingTime, setRemainingTime] = useState<string>('00 : 00 : 00');
  const [countdown, setCountdown] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);

  // Get sessionId from params
  const sessionId = params.sessionId as string;

  // Define session data type
  interface SessionData {
    status: 'active' | 'open' | 'closed' | 'ended';
    checkedInCount?: number;
    sessionId?: string;
    startTime?: string;
    endTime?: string;
  }

  // Define student type
  type Student = {
    id: string;
    name: string;
    studentId: string;
    checkInTime: string;
    totalMinutes?: number;
    attendanceStatus?: 'present' | 'absent';
    isCurrentlyCheckedIn?: boolean;
  };

  // Define checked-in students response type
  interface CheckedInStudentsResponse {
    attendanceId: string;
    checkedInCount: number;
    students: Student[];
  }

  // Parse time string like "08:00 AM" to Date object (today)
  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
  };

  // Calculate the difference in seconds between start and end time
  useEffect(() => {
    if (!startTime || !endTime) return;
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    let diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    if (diff < 0) diff = 0;
    setCountdown(diff);
  }, [startTime, endTime]);

  // Fetch session status
  const fetchSessionStatus = async (sessionId: string, token: string): Promise<SessionData> => {
    const res = await axios.get(
      `http://192.168.1.172:3000/api/attendance/instructor-status/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  };

  // Fetch checked-in students
  const fetchCheckedInStudents = async (sessionId: string, token: string): Promise<CheckedInStudentsResponse> => {
    const res = await axios.get(
      `http://192.168.1.172:3000/api/attendance/checked-in/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  };

  const { data: sessionData, refetch: refetchSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['sessionStatus', sessionId, token] as const,
    queryFn: async (): Promise<SessionData> => {
      if (!sessionId || !token) throw new Error('Missing sessionId or token');
      return fetchSessionStatus(sessionId, token);
    },
    enabled: !!sessionId && !!token,
    refetchInterval: 5000, // Poll every 5 seconds for live updates
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data (replaces cacheTime)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const { data: checkedInStudentsData, refetch: refetchStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['checkedInStudents', sessionId, token] as const,
    queryFn: async (): Promise<CheckedInStudentsResponse> => {
      if (!sessionId || !token) throw new Error('Missing sessionId or token');
      return fetchCheckedInStudents(sessionId, token);
    },
    enabled: !!sessionId && !!token,
    refetchInterval: 10000, // Poll every 10 seconds for student updates
    staleTime: 0,
    gcTime: 0, // Don't cache the data (replaces cacheTime)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Update local session state based on API response
  useEffect(() => {
    if (sessionData?.status) {
      const isActive = sessionData.status === 'active' || sessionData.status === 'open';
      setSessionActive(isActive);
      
      // If session is closed from backend, stop the countdown
      if (!isActive) {
        setCountdown(0);
        setRemainingTime('00 : 00 : 00');
      }
    }
  }, [sessionData]);

  // Timer logic for session countdown
  useEffect(() => {
    if (!sessionActive || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionActive(false);
          setRemainingTime('00 : 00 : 00');
          Alert.alert('Session Ended', 'The attendance session has ended automatically.', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, countdown]);

  // Format countdown seconds to HH : MM : SS
  useEffect(() => {
    const hours = Math.floor(countdown / 3600);
    const minutes = Math.floor((countdown % 3600) / 60);
    const seconds = countdown % 60;
    setRemainingTime(
      `${hours.toString().padStart(2, '0')} : ${minutes
        .toString()
        .padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
    );
  }, [countdown]);

  // Mutation to end the session
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const res = await axios.post(
        'http://192.168.1.172:3000/api/attendance/end-session',
        { attendanceId: sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setSessionActive(false);
      setRemainingTime('00 : 00 : 00');
      // Force refetch session status to update UI immediately
      refetchSession();
      refetchStudents();
      
      // Also invalidate any related queries in the cache
      setTimeout(() => {
        refetchSession();
        refetchStudents();
      }, 100);
      
      Alert.alert('Session Ended', 'The attendance session has ended successfully.', [
        {
          text: 'OK',
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        'Failed to End Session',
        error?.response?.data?.message || 'An error occurred. Please try again.'
      );
      // Refetch to ensure we have the latest status even on error
      refetchSession();
      refetchStudents();
    },
  });

  const handleEndSession = () => {
    // First verify if session is still active
    if (!sessionActive || sessionData?.status === 'closed' || sessionData?.status === 'ended') {
      Alert.alert('Session Already Ended', 'This attendance session has already been closed.');
      return;
    }

    Alert.alert(
      'End Session',
      'Are you sure you want to end the attendance session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            endSessionMutation.mutate();
          },
        },
      ]
    );
  };

  useEffect(() => {
    SecureStore.getItemAsync('token').then(setToken);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Force refetch when screen comes into focus
      if (sessionId && token) {
        refetchSession();
        refetchStudents();
      }
    }, [refetchSession, refetchStudents, sessionId, token])
  );

  // Also refetch when component mounts
  useEffect(() => {
    if (sessionId && token) {
      refetchSession();
      refetchStudents();
    }
  }, [sessionId, token, refetchSession, refetchStudents]);

  // Filter students based on search query
  const filteredStudents = (checkedInStudentsData?.students || []).filter((student: Student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine button state based on session status
  const isSessionClosed = sessionData?.status === 'closed' || sessionData?.status === 'ended' || !sessionActive;
  const buttonText = isSessionClosed ? 'Session Ended' : 'End Session';
  const buttonDisabled = isSessionClosed || endSessionMutation.isPending || isLoadingSession;

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={[styles.studentItem, { backgroundColor: theme.card }]}>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.studentId, { color: theme.text + '99' }]}>{item.studentId}</Text>
        {item.totalMinutes !== undefined && (
          <Text style={[styles.totalTime, { color: theme.text + '99' }]}>
            Total: {Math.floor(item.totalMinutes / 60)}h {item.totalMinutes % 60}m
          </Text>
        )}
      </View>
      <View style={styles.checkInInfo}>
        <Text style={styles.checkInTime}>{item.checkInTime}</Text>
        {item.attendanceStatus && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.attendanceStatus === 'present' ? '#34C759' : '#FF9500' }
          ]}>
            <Text style={styles.statusText}>
              {item.attendanceStatus === 'present' ? 'Present' : 'Partial'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.background === '#fff' ? 'dark-content' : 'light-content'} backgroundColor={theme.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#007AFF' }]}>
          {isSessionClosed ? 'Ended Attendance Session' : 'Active Attendance Session'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Course Info */}
      <View style={styles.courseInfo}>
        <Text style={[styles.courseCode, { color: theme.text }]}>
          {selectedCourse?.code ?? ''} - {selectedCourse?.title ?? ''}
        </Text>
        <Text style={[styles.courseDetails, { color: theme.text + '99' }]}>
          Hall: {selectedHall?.name ?? ''}, {selectedHall?.description ?? ''}, {startTime} - {endTime}
        </Text>
        <Text style={[styles.sessionStatus, { color: isSessionClosed ? '#FF3B30' : theme.text + '99' }]}>
          {isSessionClosed ? 'Session has ended' : `Session active for ${remainingTime}`}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.text }]}>
            {isLoadingStudents ? '...' : (checkedInStudentsData?.checkedInCount || 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.text + '99' }]}>Checked-in</Text>
        </View>
      </View>

      {/* End Session & Return Home Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.endSessionButton,
            buttonDisabled && { backgroundColor: '#8E8E93' },
          ]}
          onPress={handleEndSession}
          disabled={buttonDisabled}
        >
          <Text style={styles.endSessionButtonText}>
            {endSessionMutation.isPending ? 'Ending...' : buttonText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/screens/(instructor)/(tabs)')}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={20} color={theme.text + '99'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search students by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.text + '99'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.text + '99'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Students List */}
      <View style={styles.studentsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Checked-in Students ({filteredStudents.length})
        </Text>
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text + '99' }]}>
                {isLoadingStudents 
                  ? 'Loading students...' 
                  : searchQuery 
                    ? 'No students found matching your search' 
                    : 'No students checked in yet'
                }
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  placeholder: {
    width: 32,
  },
  courseInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  courseCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  courseDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  sessionStatus: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 40,
    marginBottom: 10,
  },
  endSessionButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  endSessionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  homeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
  },
  studentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 14,
    color: '#8E8E93',
  },
  totalTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  checkInInfo: {
    alignItems: 'flex-end',
  },
  checkInTime: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ActiveAttendanceScreen;