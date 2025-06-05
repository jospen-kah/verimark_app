import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/Header';

const InstructorCourseScreen = () => {
  const [searchText, setSearchText] = useState('');

  const courses = [
    { id: 1, code: 'CEF331', title: 'Advanced Database', department: 'Computer Engineering' },
    { id: 2, code: 'CSC301', title: 'Data Structures and Algorithms', department: 'Computer Science' },
    { id: 3, code: 'EEE205', title: 'Circuit Analysis', department: 'Electrical Engineering' },
    { id: 4, code: 'MEE401', title: 'Thermodynamics', department: 'Mechanical Engineering' },
    { id: 5, code: 'CSC402', title: 'Software Engineering', department: 'Computer Science' },
    { id: 6, code: 'CEF201', title: 'Digital Logic Design', department: 'Computer Engineering' },
    { id: 7, code: 'MTH301', title: 'Calculus III', department: 'Mathematics' },
    { id: 8, code: 'PHY201', title: 'Physics II', department: 'Physics' },
  ];

  type Course = {
    id: number;
    code: string;
    title: string;
    department: string;
  };

  const handleCourseSelect = (course: Course) => {
    router.push({
      pathname: '/screens/(instructor)/otherScreens/HallSelection',
      params: {
        selectedCourse: JSON.stringify(course),
      },
    });
  };

  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchText.toLowerCase()) ||
    course.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header name="Instructor" />

      {/* Title */}
      <Text style={styles.title}>Select Course</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search course by code or title"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Courses List */}
      <ScrollView style={styles.coursesList} showsVerticalScrollIndicator={false}>
        {filteredCourses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseItem}
            onPress={() => handleCourseSelect(course)}
            activeOpacity={0.7}
          >
            <View style={styles.courseInfo}>
              <Text style={styles.courseCodeTitle}>
                {course.code} {course.title}
              </Text>
              <Text style={styles.courseDepartment}>{course.department}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    // paddingTop: StatusBar.currentHeight || 0,
  },
  backIcon: {
    position: 'absolute',
    left: 20,
    paddingTop: StatusBar.currentHeight || 0,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    color: '#333',
  },
  coursesList: {
    flex: 1,
  },
  courseItem: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  courseInfo: {
    flex: 1,
  },
  courseCodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  courseDepartment: {
    fontSize: 14,
    color: '#666',
  },
});

export default InstructorCourseScreen;