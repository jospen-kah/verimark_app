import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScreenProps {
  title?: string; // Make title optional
}

const AttendanceScreen: React.FC<ScreenProps> = ({ title }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{title ?? 'Attendance'}</Text>
  </View>
);

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' }
});