import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const halls = [
  { id: 1, name: 'BGFL', description: 'FET Building, Ground Floor' },
  { id: 2, name: 'LT1', description: 'Lecture Theatre 1' },
  { id: 3, name: 'LT2', description: 'Lecture Theatre 2' },
  { id: 4, name: 'ENGHALL', description: 'Engineering Main Hall' },
];

const HallSelectionScreen = () => {
  const params = useLocalSearchParams();
  const selectedCourse = params.selectedCourse ? JSON.parse(params.selectedCourse as string) : null;

  const handleHallSelect = (hall: { id: number; name: string; description: string }) => {
    router.push({
      pathname: '/screens/(instructor)/otherScreens/StartAttendance',
      params: {
        selectedCourse: JSON.stringify(selectedCourse),
        selectedHall: JSON.stringify(hall),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Select Hall</Text>

      {/* Selected Course Info */}
      {selectedCourse && (
        <View style={styles.selectedCourseContainer}>
          <Text style={styles.selectedCourseText}>
            Selected Course: {selectedCourse.code} - {selectedCourse.title}
          </Text>
        </View>
      )}

      {/* Halls List */}
      <ScrollView style={styles.hallsList} showsVerticalScrollIndicator={false}>
        {halls.map((hall) => (
          <TouchableOpacity
            key={hall.id}
            style={styles.hallItem}
            onPress={() => handleHallSelect(hall)}
            activeOpacity={0.7}
          >
            <View style={styles.hallInfo}>
              <Text style={styles.hallName}>{hall.name}</Text>
              <Text style={styles.hallDescription}>{hall.description}</Text>
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
    paddingTop: StatusBar.currentHeight || 0,
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
  selectedCourseContainer: {
    backgroundColor: '#E8F5E8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 15,
    alignSelf: 'center',
  },
  selectedCourseText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  hallsList: {
    flex: 1,
  },
  hallItem: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  hallInfo: {
    flex: 1,
  },
  hallName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hallDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HallSelectionScreen;