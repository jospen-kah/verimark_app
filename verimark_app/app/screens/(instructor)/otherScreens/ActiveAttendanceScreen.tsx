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
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);

  // Get sessionId from params
  const sessionId = params.sessionId as string;

  // Define session data type
  interface SessionData {
    status: 'open' | 'closed';
    checkedInCount?: number;
    sessionId?: string;
    startTime?: string;
    endTime?: string;
    createdAt?: string; // Add this to get actual session start time
  }

  // Define student type
  type Student = {
    id: string;
    name: string;
    matriNumber: string;
    checkInTime: string;
    checkOutTime?: string;
    totalMinutes?: number;
    attendanceStatus?: 'present' | 'absent' | 'partial';
    isCurrentlyCheckedIn?: boolean;
    email?: string;
  };

  // Define attendance log response type
  interface AttendanceLogResponse {
    success: boolean;
    data: {
      attendanceId: string;
      sessionInfo: {
        courseId: string;
        hallId: string;
        startTime: string;
        endTime: string;
        status: string;
        date: string;
        createdAt?: string; // Add this
      };
      statistics: {
        totalCheckedIn: number;
        currentlyCheckedIn: number;
        completedAttendance: number;
      };
      students: Student[];
    };
  }

  // Define checked-in students response type
  interface CheckedInStudentsResponse {
    success: boolean;
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

  // Calculate remaining time based on actual session start time
  const calculateRemainingTime = () => {
    if (!sessionStartedAt || !endTime) return 0;
    
    const now = new Date();
    const sessionEnd = parseTime(endTime);
    
    // If we're past the end time, return 0
    if (now >= sessionEnd) return 0;
    
    // Calculate remaining seconds
    const remainingMs = sessionEnd.getTime() - now.getTime();
    return Math.max(0, Math.floor(remainingMs / 1000));
  };

  // Initialize session start time and countdown
  useEffect(() => {
    // Set session start time to now when component first loads
    if (!sessionStartedAt) {
      const startDate = new Date();
      setSessionStartedAt(startDate);
      
      // Calculate initial countdown based on current time to end time
      if (endTime) {
        const endDate = parseTime(endTime);
        const remainingMs = endDate.getTime() - startDate.getTime();
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
        setCountdown(remainingSeconds);
      }
    }
  }, [endTime]);

  // Update countdown when returning to screen
  useEffect(() => {
    if (sessionStartedAt && sessionActive) {
      const remaining = calculateRemainingTime();
      setCountdown(remaining);
    }
  }, [sessionStartedAt, sessionActive, endTime]);

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

  // Fetch attendance log (complete log with all students)
  const fetchAttendanceLog = async (sessionId: string, token: string): Promise<AttendanceLogResponse> => {
    const res = await axios.get(
      `http://192.168.1.172:3000/api/attendance-log/log/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  };

  // Fetch currently checked-in students (for real-time updates)
  const fetchCheckedInStudents = async (sessionId: string, token: string): Promise<CheckedInStudentsResponse> => {
    const res = await axios.get(
      `http://192.168.1.172:3000/api/attendance-log/checked-in/${sessionId}`,
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
    gcTime: 0, // Don't cache the data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Use attendance log for complete data when session is closed
  const { data: attendanceLogData, refetch: refetchAttendanceLog, isLoading: isLoadingLog } = useQuery({
    queryKey: ['attendanceLog', sessionId, token] as const,
    queryFn: async (): Promise<AttendanceLogResponse> => {
      if (!sessionId || !token) throw new Error('Missing sessionId or token');
      return fetchAttendanceLog(sessionId, token);
    },
    enabled: !!sessionId && !!token && sessionData?.status === 'closed',
    staleTime: 30000, // Cache for 30 seconds when session is closed
    refetchOnMount: true,
  });

  // Use real-time checked-in students for active sessions
  const { data: checkedInStudentsData, refetch: refetchStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['checkedInStudents', sessionId, token] as const,
    queryFn: async (): Promise<CheckedInStudentsResponse> => {
      if (!sessionId || !token) throw new Error('Missing sessionId or token');
      return fetchCheckedInStudents(sessionId, token);
    },
    enabled: !!sessionId && !!token && sessionData?.status !== 'closed',
    refetchInterval: 10000, // Poll every 10 seconds for student updates
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Update local session state based on API response
  useEffect(() => {
    if (sessionData?.status) {
      const isActive = sessionData.status === 'open';
      setSessionActive(isActive);
      
      // If session is closed from backend, stop the countdown
      if (!isActive) {
        setCountdown(0);
        setRemainingTime('00 : 00 : 00');
      }
    }
  }, [sessionData]);

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
      setCountdown(0);
      setRemainingTime('00 : 00 : 00');
      // Force refetch session status to update UI immediately
      refetchSession();
      refetchAttendanceLog();
      
      // Also invalidate any related queries in the cache
      setTimeout(() => {
        refetchSession();
        refetchAttendanceLog();
      }, 100);
    },
    onError: (error: any) => {
      console.error('Failed to end session:', error);
      // Still update local state even if API call fails to prevent UI inconsistency
      setSessionActive(false);
      setCountdown(0);
      setRemainingTime('00 : 00 : 00');
      
      // Refetch to ensure we have the latest status
      refetchSession();
      refetchAttendanceLog();
    },
  });

  // Function to automatically end session
  const autoEndSession = React.useCallback(async () => {
    if (!sessionId || !token) return;
    
    try {
      console.log('Auto-ending session:', sessionId);
      
      const response = await axios.post(
        'http://192.168.1.172:3000/api/attendance/end-session',
        { attendanceId: sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Auto-end session response:', response.data);
      
      // Update local state
      setSessionActive(false);
      setCountdown(0);
      setRemainingTime('00 : 00 : 00');
      
      // Force refetch to update UI
      await refetchSession();
      await refetchAttendanceLog();
      
      // Show alert after successful API call
      Alert.alert(
        'Session Ended', 
        'The attendance session has ended automatically.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Auto end session failed:', error);
      
      // Update local state even if API fails
      setSessionActive(false);
      setCountdown(0);
      setRemainingTime('00 : 00 : 00');
      
      // Show alert even if API call fails
      Alert.alert(
        'Session Time Expired', 
        'The attendance session time has expired. Please check your connection and try again if needed.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [sessionId, token, refetchSession, refetchAttendanceLog]);

  // Manual end session handler
  const handleEndSession = React.useCallback(async () => {
    // First verify if session is still active
    if (!sessionActive || sessionData?.status === 'closed') {
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
          onPress: async () => {
            try {
              console.log('Manual end session for:', sessionId);
              
              const response = await axios.post(
                'http://192.168.1.172:3000/api/attendance/end-session',
                { attendanceId: sessionId },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              console.log('Manual end session response:', response.data);
              
              // Update local state
              setSessionActive(false);
              setCountdown(0);
              setRemainingTime('00 : 00 : 00');
              
              // Force refetch to update UI
              await refetchSession();
              await refetchAttendanceLog();
              
              Alert.alert('Session Ended', 'The attendance session has ended successfully.', [
                {
                  text: 'OK',
                },
              ]);
            } catch (error: any) {
              console.error('Manual end session failed:', error);
              Alert.alert(
                'Failed to End Session',
                error?.response?.data?.message || 'An error occurred. Please try again.'
              );
            }
          },
        },
      ]
    );
  }, [sessionActive, sessionData, sessionId, token, refetchSession, refetchAttendanceLog]);

  // Timer logic for session countdown
  useEffect(() => {
    if (!sessionActive || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Automatically end the session when timer expires
          if (sessionId && token) {
            autoEndSession();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, countdown, sessionId, token, autoEndSession]);

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

  useEffect(() => {
    SecureStore.getItemAsync('token').then(setToken);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Recalculate remaining time when screen comes into focus
      if (sessionActive && sessionStartedAt) {
        const remaining = calculateRemainingTime();
        setCountdown(remaining);
      }
      
      // Force refetch when screen comes into focus
      if (sessionId && token) {
        refetchSession();
        if (sessionData?.status === 'closed') {
          refetchAttendanceLog();
        } else {
          refetchStudents();
        }
      }
    }, [refetchSession, refetchAttendanceLog, refetchStudents, sessionId, token, sessionData?.status, sessionActive, sessionStartedAt])
  );

  // Also refetch when component mounts
  useEffect(() => {
    if (sessionId && token) {
      refetchSession();
      if (sessionData?.status === 'closed') {
        refetchAttendanceLog();
      } else {
        refetchStudents();
      }
    }
  }, [sessionId, token, refetchSession, refetchAttendanceLog, refetchStudents, sessionData?.status]);

  // Get students data based on session status
  const getStudentsData = () => {
    if (sessionData?.status === 'closed' && attendanceLogData?.success) {
      return {
        students: attendanceLogData.data.students,
        checkedInCount: attendanceLogData.data.statistics.totalCheckedIn,
        isLoading: isLoadingLog
      };
    } else if (checkedInStudentsData?.success) {
      return {
        students: checkedInStudentsData.students,
        checkedInCount: checkedInStudentsData.checkedInCount,
        isLoading: isLoadingStudents
      };
    }
    return {
      students: [],
      checkedInCount: 0,
      isLoading: isLoadingStudents || isLoadingLog
    };
  };

  const { students, checkedInCount, isLoading } = getStudentsData();

  // Filter students based on search query
  const filteredStudents = students.filter((student: Student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matriNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine button state based on session status
  const isSessionClosed = sessionData?.status === 'closed' || !sessionActive;
  const buttonText = isSessionClosed ? 'Session Ended' : 'End Session';
  const buttonDisabled = isSessionClosed || isLoadingSession;

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={[styles.studentItem, { backgroundColor: theme.card }]}>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.studentId, { color: theme.text + '99' }]}>
          {item.matriNumber}
        </Text>
        {item.email && (
          <Text style={[styles.studentEmail, { color: theme.text + '66' }]}>
            {item.email}
          </Text>
        )}
        {item.totalMinutes !== undefined && (
          <Text style={[styles.totalTime, { color: theme.text + '99' }]}>
            Total: {Math.floor(item.totalMinutes / 60)}h {item.totalMinutes % 60}m
          </Text>
        )}
      </View>
      <View style={styles.checkInInfo}>
        <Text style={styles.checkInTime}>{item.checkInTime}</Text>
        {item.checkOutTime && (
          <Text style={[styles.checkOutTime, { color: theme.text + '99' }]}>
            Out: {item.checkOutTime}
          </Text>
        )}
        {item.attendanceStatus && (
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: 
                item.attendanceStatus === 'present' ? '#34C759' : 
                item.attendanceStatus === 'partial' ? '#FF9500' : '#FF3B30'
            }
          ]}>
            <Text style={styles.statusText}>
              {item.attendanceStatus === 'present' ? 'Present' : 
               item.attendanceStatus === 'partial' ? 'Partial' : 'Absent'}
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
          {selectedCourse?.code ?? ''} - {selectedCourse?.name ?? selectedCourse?.title ?? ''}
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
            {isLoading ? '...' : checkedInCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.text + '99' }]}>
            {isSessionClosed ? 'Total Attended' : 'Checked-in'}
          </Text>
        </View>
      </View>

      {/* End Session & Return Home Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.endSessionButton,
            {
              backgroundColor: isSessionClosed 
                ? '#8E8E93'  // Ash/gray when ended
                : '#FF3B30'  // Red when active
            }
          ]}
          onPress={handleEndSession}
          disabled={buttonDisabled}
        >
          <Text style={[
            styles.endSessionButtonText,
            {
              color: isSessionClosed ? '#FFFFFF99' : '#FFFFFF'  // Lighter text when disabled
            }
          ]}>
            {buttonText}
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
          {isSessionClosed ? 'Attendance Log' : 'Checked-in Students'} ({filteredStudents.length})
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
                {isLoading 
                  ? 'Loading students...' 
                  : searchQuery 
                    ? 'No students found matching your search' 
                    : isSessionClosed
                      ? 'No attendance records found'
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
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
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
    marginBottom: 2,
  },
  checkOutTime: {
    fontSize: 12,
    color: '#8E8E93',
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