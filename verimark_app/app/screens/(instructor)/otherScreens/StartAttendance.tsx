import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme context

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const ampm = ['AM', 'PM'];

const StartAttendance = () => {
  const params = useLocalSearchParams();
  const { theme } = useTheme(); // <-- Use the theme

  const selectedHall = params.selectedHall ? JSON.parse(params.selectedHall as string) : null;
  const selectedCourse = params.selectedCourse ? JSON.parse(params.selectedCourse as string) : null;

  // Time picker states
  const [startHour, setStartHour] = useState('08');
  const [startMinute, setStartMinute] = useState('00');
  const [startAMPM, setStartAMPM] = useState('AM');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [endAMPM, setEndAMPM] = useState('AM');

  // Modal states
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempStartHour, setTempStartHour] = useState('08');
  const [tempStartMinute, setTempStartMinute] = useState('00');
  const [tempStartAMPM, setTempStartAMPM] = useState('AM');
  const [tempEndHour, setTempEndHour] = useState('10');
  const [tempEndMinute, setTempEndMinute] = useState('00');
  const [tempEndAMPM, setTempEndAMPM] = useState('AM');

  const getTimeString = (h: string, m: string, ap: string) => `${h}:${m} ${ap}`;
  const startTime = getTimeString(startHour, startMinute, startAMPM);
  const endTime = getTimeString(endHour, endMinute, endAMPM);

  const handleStartTimeConfirm = () => {
    setStartHour(tempStartHour);
    setStartMinute(tempStartMinute);
    setStartAMPM(tempStartAMPM);
    setShowStartTimePicker(false);
  };

  const handleEndTimeConfirm = () => {
    setEndHour(tempEndHour);
    setEndMinute(tempEndMinute);
    setEndAMPM(tempEndAMPM);
    setShowEndTimePicker(false);
  };

  const openStartTimePicker = () => {
    setTempStartHour(startHour);
    setTempStartMinute(startMinute);
    setTempStartAMPM(startAMPM);
    setShowStartTimePicker(true);
  };

  const openEndTimePicker = () => {
    setTempEndHour(endHour);
    setTempEndMinute(endMinute);
    setTempEndAMPM(endAMPM);
    setShowEndTimePicker(true);
  };

  const handleStartAttendance = () => {
    if (!startTime || !endTime) {
      Alert.alert(
        'Missing Information',
        'Please select both start time and end time before starting attendance.',
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert(
      'Attendance Started',
      `Course: ${selectedCourse?.code} - ${selectedCourse?.title}\nHall: ${selectedHall?.name}\nTime: ${startTime} - ${endTime}`,
      [
        {
          text: 'OK',
          onPress: () => {
            router.push({
              pathname: '/screens/(instructor)/otherScreens/ActiveAttendanceScreen',
              params: {
                selectedCourse: JSON.stringify(selectedCourse),
                selectedHall: JSON.stringify(selectedHall),
                startTime,
                endTime,
              },
            });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]}>Attendance Initiation</Text>

      {/* Time Selection Section */}
      <View style={styles.timeSelectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Set Class Duration</Text>
        {/* Start Time */}
        <View style={styles.timeInputContainer}>
          <Text style={[styles.timeLabel, { color: theme.text }]}>Start Time</Text>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: theme.card, borderColor: theme.text + '22' }]}
            onPress={openStartTimePicker}
          >
            <Text style={[styles.timeButtonText, { color: theme.text }]}>{startTime}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
        {/* End Time */}
        <View style={styles.timeInputContainer}>
          <Text style={[styles.timeLabel, { color: theme.text }]}>End Time</Text>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: theme.card, borderColor: theme.text + '22' }]}
            onPress={openEndTimePicker}
          >
            <Text style={[styles.timeButtonText, { color: theme.text }]}>{endTime}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Course Information Card */}
      <View style={[styles.courseCard, { backgroundColor: theme.card, borderColor: theme.text + '22' }]}>
        <Text style={[styles.courseTitle, { color: theme.text }]}>
          {selectedCourse?.code ?? 'No Code'} - {selectedCourse?.title ?? 'No Title'}
        </Text>
        <Text style={[styles.courseDetail, { color: theme.text + '99' }]}>
          Hall: {selectedHall?.name ?? 'No Hall'}, {selectedHall?.description ?? ''}
        </Text>
        <Text style={[styles.courseDetail, { color: theme.text + '99' }]}>
          Time: {startTime && endTime ? `${startTime} - ${endTime}` : 'Please set start and end time'}
        </Text>
      </View>

      {/* Start Button */}
      {startHour && startMinute && startAMPM && endHour && endMinute && endAMPM ? (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartAttendance}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      ) : null}

      {/* Start Time Picker Modal */}
      <Modal
        visible={showStartTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStartTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Start Time</Text>
              <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.text }]}>Hour</Text>
                <Picker
                  selectedValue={tempStartHour}
                  style={styles.modalPicker}
                  onValueChange={setTempStartHour}
                  itemStyle={{ fontSize: 28, color: theme.text }} // Increase font size
                >
                  {hours.map(h => <Picker.Item key={h} label={h} value={h} />)}
                </Picker>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.text }]}>Minute</Text>
                <Picker
                  selectedValue={tempStartMinute}
                  style={styles.modalPicker}
                  onValueChange={setTempStartMinute}
                  itemStyle={{ fontSize: 28, color: theme.text }} // Increase font size
                >
                  {minutes.map(m => <Picker.Item key={m} label={m} value={m} />)}
                </Picker>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.text }]}>AM/PM</Text>
                <Picker
                  selectedValue={tempStartAMPM}
                  style={styles.modalPicker}
                  onValueChange={setTempStartAMPM}
                  itemStyle={{ fontSize: 28, color: theme.text }} // Increase font size
                >
                  {ampm.map(ap => <Picker.Item key={ap} label={ap} value={ap} />)}
                </Picker>
              </View>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleStartTimeConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* End Time Picker Modal */}
      <Modal
        visible={showEndTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEndTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select End Time</Text>
              <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.text }]}>Hour</Text>
                <Picker
                  selectedValue={tempEndHour}
                  style={styles.modalPicker}
                  onValueChange={setTempEndHour}
                  itemStyle={{ fontSize: 28, color: theme.text }} // Increase font size
                >
                  {hours.map(h => <Picker.Item key={h} label={h} value={h} />)}
                </Picker>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.text }]}>Minute</Text>
                <Picker
                  selectedValue={tempEndMinute}
                  style={styles.modalPicker}
                  onValueChange={setTempEndMinute}
                  itemStyle={{ fontSize: 28, color: theme.text }} // Increase font size
                >
                  {minutes.map(m => <Picker.Item key={m} label={m} value={m} />)}
                </Picker>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.text }]}>AM/PM</Text>
                <Picker
                  selectedValue={tempEndAMPM}
                  style={styles.modalPicker}
                  onValueChange={setTempEndAMPM}
                  itemStyle={{ fontSize: 28, color: theme.text }} // Increase font size
                >
                  {ampm.map(ap => <Picker.Item key={ap} label={ap} value={ap} />)}
                </Picker>
              </View>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleEndTimeConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 30,
  },
  timeSelectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  timeInputContainer: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    minWidth: 180, // Increased width for better visibility
    marginBottom: 5,
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalPicker: {
    height: 180, // Increased height for better visibility
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  courseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  courseDetail: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  startButtonTextDisabled: {
    color: '#999999',
  },
});

export default StartAttendance;