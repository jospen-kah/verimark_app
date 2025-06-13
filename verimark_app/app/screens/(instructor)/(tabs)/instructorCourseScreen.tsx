import React, { useState } from 'react';
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
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useTheme } from '../../../../ThemeContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Course = {
  _id: string;
  code: string;
  title: string;
  department: string;
};

// Fetch all courses with no restriction
const fetchAllCourses = async () => {
  const res = await axios.get('http://192.168.1.172:3000/api/courses');
  return res.data; // Should be an array of all courses
};

const InstructorCourseScreen = () => {
  const [searchText, setSearchText] = useState('');
  const { theme } = useTheme();

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['allCourses'],
    queryFn: fetchAllCourses,
  });
  // Log the fetched courses for debugging
  if (courses) {
    console.log('Fetched courses:', courses);
  }
  const handleCourseSelect = (course: Course) => {
    router.push({
      pathname: '/screens/(instructor)/otherScreens/HallSelection',
      params: {
        selectedCourse: JSON.stringify(course),
      },
    });
  };

  const filteredCourses = Array.isArray(courses)
    ? courses.filter(course =>
        course.code.toLowerCase().includes(searchText.toLowerCase()) ||
        course.title.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header name="Instructor" />

      <View style={styles.subcontainer}>
        <Text style={[styles.title, { color: theme.text }]}>Select Course</Text>

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
          <ActivityIndicator color={theme.text} style={{ marginTop: 30 }} />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 30 }}>Failed to load courses.</Text>
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
                No courses found.
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
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