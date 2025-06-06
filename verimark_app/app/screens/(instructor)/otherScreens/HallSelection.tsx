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
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme context

const halls = [
  { id: 1, name: 'BGFL', description: 'FET Building, Ground Floor' },
  { id: 2, name: 'LT1', description: 'Lecture Theatre 1' },
  { id: 3, name: 'LT2', description: 'Lecture Theatre 2' },
  { id: 4, name: 'ENGHALL', description: 'Engineering Main Hall' },
];

const HallSelectionScreen = () => {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Select Hall</Text>

      {/* Selected Course Info */}
      {selectedCourse && (
        <View style={[styles.selectedCourseContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.selectedCourseText, { color: theme.text }]}>
            Selected Course: {selectedCourse.code} - {selectedCourse.title}
          </Text>
        </View>
      )}

      {/* Halls List */}
      <ScrollView style={styles.hallsList} showsVerticalScrollIndicator={false}>
        {halls.map((hall) => (
          <TouchableOpacity
            key={hall.id}
            style={[
              styles.hallItem,
              { backgroundColor: theme.card, borderColor: theme.text + '22' },
            ]}
            onPress={() => handleHallSelect(hall)}
            activeOpacity={0.7}
          >
            <View style={styles.hallInfo}>
              <Text style={[styles.hallName, { color: theme.text }]}>{hall.name}</Text>
              <Text style={[styles.hallDescription, { color: theme.text + '99' }]}>{hall.description}</Text>
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
    textAlign: 'center',
    marginBottom: 15,
  },
  selectedCourseContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 15,
    alignSelf: 'center',
  },
  selectedCourseText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hallsList: {
    flex: 1,
  },
  hallItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  hallInfo: {
    flex: 1,
  },
  hallName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hallDescription: {
    fontSize: 14,
  },
});

export default HallSelectionScreen;