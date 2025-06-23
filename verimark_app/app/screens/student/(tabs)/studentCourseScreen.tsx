import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Header from '@/components/Header';
import ClassCard from '@/components/ClassCard';
import { router } from 'expo-router';
import { useTheme } from '@/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// TypeScript interfaces - Updated to match actual API response
interface Instructor {
  _id: string;
  firstName?: string; // Make optional since they might not always be present
  lastName?: string;  // Make optional since they might not always be present
  title?: string;
  email: string;
  name?: string; // Make optional since it might not always be present
}

interface Course {
  _id: string;
  title: string;
  code: string;
  instructorId: Instructor | string; // Can be populated object or just ID string
  createdAt: string;
}

interface StudentData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledCourses: string[];
}

interface CoursesResponse {
  success: boolean;
  data: Course[];
  message: string;
}

// API function to fetch instructor data
const fetchInstructor = async (instructorId: string): Promise<Instructor> => {
  const res = await axios.get<Instructor>(`http://192.168.1.172:3000/api/user/${instructorId}`);
  return res.data;
};

// API function to fetch all courses
const fetchAllCourses = async (): Promise<CoursesResponse> => {
  console.log('Fetching all courses');
  const token = await SecureStore.getItemAsync('token');
  const res = await axios.get<CoursesResponse>('http://192.168.1.172:3000/api/courses', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Log the response to see the structure
  console.log('Courses API Response:', JSON.stringify(res.data, null, 2));
  
  return res.data;
};

// API function to fetch student profile
const fetchStudentProfile = async (studentId: string): Promise<StudentData> => {
  console.log('Fetching student profile for userId:', studentId);
  const res = await axios.get<StudentData>(`http://192.168.1.172:3000/api/user/${studentId}`);
  return res.data;
};

// Updated helper function to get instructor display name
const getInstructorDisplayName = (instructor: Instructor | string | null | undefined): string => {
  if (!instructor) return 'No instructor assigned';
  
  if (typeof instructor === 'string') {
    // If instructor is just an ID string
    return 'Instructor not loaded';
  }
  
  // Check if it's a populated instructor object
  if (typeof instructor === 'object' && instructor._id) {
    // First try the 'name' field (if available)
    if (instructor.name) {
      return instructor.name;
    }
    
    // Then try firstName/lastName combination
    if (instructor.firstName || instructor.lastName) {
      const title = instructor.title || '';
      const firstName = instructor.firstName || '';
      const lastName = instructor.lastName || '';
      return `${title} ${firstName} ${lastName}`.trim();
    }
    
    // If only email is available, extract name from email or use email
    if (instructor.email) {
      // Try to extract name from email (before @ symbol)
      const emailName = instructor.email.split('@')[0];
      // Convert email username to a more readable format
      const displayName = emailName
        .replace(/[._]/g, ' ') // Replace dots and underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
      
      return displayName || instructor.email;
    }
  }
  
  // Fallback if instructor object exists but no useful fields
  return 'Instructor information unavailable';
};

const StudentCourseScreen: React.FC = () => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');

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
        queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      }
    }, [queryClient, studentId])
  );

  const {
    data: studentData,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<StudentData>({
    queryKey: ['studentProfile', studentId],
    queryFn: () => fetchStudentProfile(studentId as string),
    enabled: !!studentId,
  });

  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useQuery<CoursesResponse>({
    queryKey: ['allCourses'],
    queryFn: fetchAllCourses,
    enabled: !!studentId,
  });

  if (!studentId || profileLoading || coursesLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={theme.text} size="large" />
      </View>
    );
  }

  if (profileError || coursesError) {
    return (
      <View style={styles.container}>
        <Header name="Student" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading courses</Text>
          <TouchableOpacity onPress={() => refetchCourses()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const firstName = studentData?.firstName || 'Student';
  const lastName = studentData?.lastName || '';
  const name = `${firstName} ${lastName}`;

  // Extract courses from response
  const courses = coursesResponse?.success ? coursesResponse.data : [];

  // Debug: Log the first course to see the structure
  if (courses && courses.length > 0) {
    console.log('First course data:', JSON.stringify(courses[0], null, 2));
    console.log('InstructorId type:', typeof courses[0].instructorId);
    console.log('InstructorId value:', courses[0].instructorId);
    
    // Check if instructor is populated
    if (courses[0].instructorId && typeof courses[0].instructorId === 'object') {
      console.log('Instructor is populated:', courses[0].instructorId);
    }
  }

  // Filter courses by search text (course code or name) with proper typing
  const filteredCourses = courses?.filter((course: Course) => {
    const searchLower = searchText.toLowerCase();
    const courseCode = course.code?.toLowerCase() || '';
    const courseTitle = course.title?.toLowerCase() || '';
    
    // Updated instructor name handling with proper typing
    let instructorName = '';
    if (course.instructorId && typeof course.instructorId === 'object') {
      // This is a populated instructor object
      const instructor = course.instructorId as Instructor;
      
      // First try the 'name' field (if available)
      if (instructor.name) {
        instructorName = instructor.name.toLowerCase();
      } else if (instructor.firstName || instructor.lastName) {
        // Otherwise construct from firstName/lastName
        const title = instructor.title || '';
        const firstName = instructor.firstName || '';
        const lastName = instructor.lastName || '';
        instructorName = `${title} ${firstName} ${lastName}`.toLowerCase().trim();
      } else if (instructor.email) {
        // Use email-based name for search
        const emailName = instructor.email.split('@')[0];
        instructorName = emailName.replace(/[._]/g, ' ').toLowerCase();
      }
    }
    
    return (
      courseCode.includes(searchLower) ||
      courseTitle.includes(searchLower) ||
      instructorName.includes(searchLower)
    );
  });

  // For now, we'll consider courses as active if they have recent activity
  const activeCourses = filteredCourses?.filter((course: Course) => {
    // Add your logic here to determine if course is active
    return true; // Placeholder - modify based on your needs
  }) || [];
  
  const inactiveCourses = filteredCourses?.filter((course: Course) => {
    // Add your logic here to determine if course is inactive
    return false; // Placeholder - modify based on your needs
  }) || [];

  const handleCoursePress = (course: Course) => {
    const courseCode = course.code || 'N/A';
    const courseTitle = course.title || 'Unnamed Course';
    const instructorName = getInstructorDisplayName(course.instructorId);
    
    Alert.alert(
      'Course Information',
      `${courseCode} - ${courseTitle}\n\nInstructor: ${instructorName}\n\nTo check-in, please use the active sessions on the home screen.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Header name={name} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>My Courses</Text>
              <Text style={styles.sub}>Manage your enrolled courses</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>All Courses</Text>

          <TextInput
            placeholder="Search courses by code, name or lecturer..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />

          {/* All Courses Section */}
          {filteredCourses && filteredCourses.length > 0 ? (
            filteredCourses.map((course: Course) => (
              <TouchableOpacity
                key={course._id}
                onPress={() => handleCoursePress(course)}
              >
                <ClassCard
                  title={`${course.code || 'N/A'} - ${course.title || 'Unnamed Course'}`}
                  time={getInstructorDisplayName(course.instructorId)}
                  status="Available"
                />
              </TouchableOpacity>
            ))
          ) : null}

          {/* No courses found */}
          {(!courses || courses.length === 0) && (
            <Text style={styles.noCoursesText}>No courses found.</Text>
          )}

          {/* No filtered results */}
          {courses && courses.length > 0 && filteredCourses && filteredCourses.length === 0 && (
            <Text style={styles.noCoursesText}>No courses match your search.</Text>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    color: '#4f9dfc',
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
  noCoursesText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4f9dfc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StudentCourseScreen;