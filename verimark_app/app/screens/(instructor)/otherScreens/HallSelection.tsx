import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../ThemeContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Fetch all halls from backend
const fetchAllHalls = async () => {
  const res = await axios.get('http://192.168.1.107:3000/api/halls/');
  return res.data; // Should be an array of all halls
};

const HallSelectionScreen = () => {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const selectedCourse = params.selectedCourse ? JSON.parse(params.selectedCourse as string) : null;

  // Fetch halls using react-query
  const { data: halls, isLoading, error } = useQuery({
    queryKey: ['allHalls'],
    queryFn: fetchAllHalls,
  });

  const handleHallSelect = (hall: any) => {
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
      {isLoading ? (
        <ActivityIndicator color={theme.text} style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 30 }}>
          Failed to load halls.
        </Text>
      ) : (
        <ScrollView style={styles.hallsList} showsVerticalScrollIndicator={false}>
          {Array.isArray(halls) && halls.length > 0 ? (
            halls.map((hall) => (
              <TouchableOpacity
                key={hall._id}
                style={[
                  styles.hallItem,
                  { backgroundColor: theme.card, borderColor: theme.text + '22' },
                ]}
                onPress={() => handleHallSelect(hall)}
                activeOpacity={0.7}
              >
                <View style={styles.hallInfo}>
                  <Text style={[styles.hallName, { color: theme.text }]}>{hall.name}</Text>
                  <Text style={[styles.hallDescription, { color: theme.text + '99' }]}>
                    Floor: {hall.floor}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: theme.text, textAlign: 'center', marginTop: 30 }}>
              No halls found.
            </Text>
          )}
        </ScrollView>
      )}
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