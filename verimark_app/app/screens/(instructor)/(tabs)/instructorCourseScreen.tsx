import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Header from '@/components/Header';
import { useTheme } from '../../../../ThemeContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

type Course = {
  _id: string;
  code: string;
  title: string;
  department: string;
  instructorId: string;
};

// Fetch courses by instructor ID
const fetchInstructorCourses = async (instructorId: string) => {
  if (!instructorId) {
    throw new Error('Instructor ID is required');
  }
  
  try {
    console.log('Fetching courses for instructor:', instructorId);
    const res = await axios.get(`http://192.168.1.172:3000/api/courses/instructor/${instructorId}`);
    console.log('API Response:', res.data); // Debug log
    return res.data.data || res.data; // Handle both nested and direct response formats
  } catch (error) {
    // Type-safe error handling
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
      if (error.response?.status === 500) {
        throw new Error(`Server error: ${error.response?.data?.message || 'Internal server error'}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

const InstructorCourseScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Get instructor ID from secure storage
  useEffect(() => {
    const getInstructorId = async () => {
      try {
        // Replace 'userId' with whatever key you used to store the user ID
        const storedUserId = await SecureStore.getItemAsync('userId');
        // Alternative keys you might have used:
        // const storedUserId = await SecureStore.getItemAsync('instructorId');
        // const storedUserId = await SecureStore.getItemAsync('user_id');
        // const storedUserId = await SecureStore.getItemAsync('id');
        
        console.log('Retrieved instructor ID from secure storage:', storedUserId);
        setInstructorId(storedUserId);
      } catch (error) {
        console.error('Error retrieving instructor ID from secure storage:', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    getInstructorId();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (instructorId) {
        console.log('Screen focused, refreshing courses...');
        // Invalidate and refetch the query
        queryClient.invalidateQueries({ queryKey: ['instructorCourses', instructorId] });
      }
    }, [instructorId, queryClient])
  );

  const { data: courses, isLoading, error, refetch } = useQuery({
    queryKey: ['instructorCourses', instructorId],
    queryFn: () => fetchInstructorCourses(instructorId!), // Use non-null assertion
    enabled: !!instructorId, // Only run query if instructorId exists and is not null
    staleTime: 0, // Always consider data stale to trigger refresh
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes (formerly cacheTime)
  });

  // Log the fetched courses for debugging
  if (courses) {
    console.log('Fetched instructor courses:', courses);
  }

  const handleCourseSelect = (course: Course) => {
    router.push({
      pathname: '/screens/(instructor)/otherScreens/HallSelection',
      params: {
        selectedCourse: JSON.stringify(course),
      },
    });
  };

  // Manual refresh function (optional - you can add a pull-to-refresh or refresh button)
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
  };

  const filteredCourses = Array.isArray(courses)
    ? courses.filter(course =>
        course.code.toLowerCase().includes(searchText.toLowerCase()) ||
        course.title.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  // Show loading while getting instructor ID
  if (instructorId === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header name="Instructor" />
        <View style={styles.subcontainer}>
          <ActivityIndicator color={theme.text} style={{ marginTop: 50 }} />
          <Text style={[styles.title, { color: theme.text, marginTop: 20 }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Show error if no instructor ID found in storage
  if (!instructorId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header name="Instructor" />
        <View style={styles.subcontainer}>
          <Text style={[styles.title, { color: theme.text }]}>Error</Text>
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 30 }}>
            Instructor ID not found. Please log in again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name="Instructor" />

      <View style={styles.subcontainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Select Course</Text>
          {/* Optional: Add manual refresh button */}
          <TouchableOpacity 
            onPress={handleManualRefresh}
            style={styles.refreshButton}
            disabled={isLoading}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={isLoading ? theme.text + '50' : theme.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={20} color={theme.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search course by code or title"
            placeholderTextColor={theme.text + '99'}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.text} style={{ marginTop: 30 }} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Refreshing courses...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to load courses: {error.message}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.card }]}
              onPress={handleManualRefresh}
            >
              <Text style={[styles.retryButtonText, { color: theme.text }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.coursesList} showsVerticalScrollIndicator={false}>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <TouchableOpacity
                  key={course._id}
                  style={[styles.courseItem, { backgroundColor: theme.card, borderColor: theme.text + '22' }]}
                  onPress={() => handleCourseSelect(course)}
                  activeOpacity={0.7}
                >
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseCodeTitle, { color: theme.text }]}>
                      {course.code} - {course.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: theme.text, textAlign: 'center', marginTop: 30 }}>
                No courses found for this instructor.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backIcon: {
    position: 'absolute',
    left: 20,
    paddingTop: StatusBar.currentHeight || 0,
    zIndex: 1,
  },
  subcontainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  refreshButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: '600',
  },
  coursesList: {
    flex: 1,
  },
  courseItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  courseInfo: {
    flex: 1,
  },
  courseCodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default InstructorCourseScreen;