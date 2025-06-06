import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme
import RNPickerSelect from 'react-native-picker-select';

const courses = [
    { id: 1, code: 'CEF331', title: 'Advanced Database' },
    { id: 2, code: 'CSC301', title: 'Data Structures' },
    { id: 3, code: 'EEE205', title: 'Circuit Analysis' },
];

const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const ReportScreen = () => {
    const [selectedCourse, setSelectedCourse] = useState<string | undefined>();
    const [selectedDay, setSelectedDay] = useState<string | undefined>();
    const [weeklyCourse, setWeeklyCourse] = useState<string | undefined>();
    const { theme } = useTheme();

    const handleDownloadDaily = () => {
        if (!selectedCourse || !selectedDay) {
            alert('Please select both course and day.');
            return;
        }
        // Implement download logic here
        alert(`Downloading daily report for ${selectedCourse} on ${selectedDay}`);
    };

    const handleDownloadWeekly = () => {
        if (!weeklyCourse) {
            alert('Please select a course for weekly report.');
            return;
        }
        // Implement download logic here
        alert(`Downloading weekly report for ${weeklyCourse}`);
    };

    const handleShareDaily = async () => {
        if (!selectedCourse || !selectedDay) {
            alert('Please select both course and day.');
            return;
        }
        // Replace this with your actual report data or file
        const message = `Attendance Daily Report\nCourse: ${selectedCourse}\nDay: ${selectedDay}`;
        try {
            await Share.share({
                message,
            });
        } catch (error) {
            alert('Failed to share report.');
        }
    };

    const handleShareWeekly = async () => {
        if (!weeklyCourse) {
            alert('Please select a course for weekly report.');
            return;
        }
        // Replace this with your actual report data or file
        const message = `Attendance Weekly Report\nCourse: ${weeklyCourse}`;
        try {
            await Share.share({
                message,
            });
        } catch (error) {
            alert('Failed to share report.');
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.background === '#fff' ? 'dark-content' : 'light-content'} backgroundColor={theme.background} />
            <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Download Attendance Reports</Text>

            {/* Daily Report Section */}
            <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.text + '11' }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Report</Text>
                <Text style={[styles.label, { color: theme.text }]}>Select Course</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.card, borderColor: theme.text + '22' }]}>
                    <RNPickerSelect
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                        items={[
                            { label: 'Select course...', value: undefined, color: '#999' },
                            ...courses.map(course => ({
                                label: `${course.code} - ${course.title}`,
                                value: course.code,
                                color: '#000', // Always black for dropdown
                            })),
                        ]}
                        style={{
                            inputIOS: {
                                color: theme.text,
                                backgroundColor: theme.card,
                                paddingVertical: 12,
                                paddingHorizontal: 10,
                                borderRadius: 8,
                                fontSize: 17,
                            },
                            inputAndroid: {
                                color: theme.text,
                                backgroundColor: theme.card,
                                paddingVertical: 12,
                                paddingHorizontal: 10,
                                borderRadius: 8,
                                fontSize: 17,
                            },
                            viewContainer: {
                                backgroundColor: theme.card,
                                borderRadius: 8,
                            },
                            modalViewMiddle: {
                                backgroundColor: '#fff', // Always white for modal
                            },
                            modalViewBottom: {
                                backgroundColor: '#fff', // Always white for modal
                            },
                            placeholder: {
                                color: '#999',
                            },
                            iconContainer: {
                                top: 18,
                                right: 12,
                            },
                        }}
                        useNativeAndroidPickerStyle={false}
                        placeholder={{ label: 'Select course...', value: undefined, color: '#999' }}
                        Icon={() => <Ionicons name="chevron-down" size={20} color={theme.text} />}
                    />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Select Day</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: '#fff', borderColor: theme.text + '22' }]}>
                    <Picker
                        selectedValue={selectedDay}
                        onValueChange={setSelectedDay}
                        style={[styles.picker, { color: '#000', backgroundColor: '#fff' }]}
                        dropdownIconColor="#000"
                    >
                        <Picker.Item label="Select day..." value={undefined} color="#999" />
                        {days.map(day => (
                            <Picker.Item key={day} label={day} value={day} color="#000" />
                        ))}
                    </Picker>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadDaily}>
                        <Ionicons name="download-outline" size={20} color="#fff" />
                        <Text style={styles.downloadButtonText}>Download Daily Report</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShareDaily}>
                        <Ionicons name="share-social-outline" size={20} color="#fff" />
                        <Text style={styles.downloadButtonText}>Share</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Weekly Report Section */}
            <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.text + '11' }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Report</Text>
                <Text style={[styles.label, { color: theme.text }]}>Select Course</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.background, borderColor: theme.text + '22' }]}>
                    <Picker
                        selectedValue={weeklyCourse}
                        onValueChange={setWeeklyCourse}
                        style={[styles.picker, { color: '#000', backgroundColor: '#fff' }]}
                        dropdownIconColor="#000"
                    >
                        <Picker.Item label="Select course..." value={undefined} color="#999" />
                        {courses.map(course => (
                            <Picker.Item
                                key={course.id}
                                label={`${course.code} - ${course.title}`}
                                value={course.code}
                                color="#000"
                            />
                        ))}
                    </Picker>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadWeekly}>
                        <Ionicons name="download-outline" size={20} color="#fff" />
                        <Text style={styles.downloadButtonText}>Download Weekly Report</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShareWeekly}>
                        <Ionicons name="share-social-outline" size={20} color="#fff" />
                        <Text style={styles.downloadButtonText}>Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#fff',
        flexGrow: 1,
        paddingTop: StatusBar.currentHeight || 0,
    },
    backIcon: {
        position: 'absolute',
        left: 20,
        zIndex: 1,
        paddingTop: StatusBar.currentHeight || 0,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 24,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        marginTop: 14,
        fontWeight: '600',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: '#fff',
        overflow: 'hidden',
        minHeight: 56,
        justifyContent: 'center',
    },
    picker: {
        height: 56,
        width: '100%',
        fontSize: 17,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
        justifyContent: 'flex-start',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#34C759',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default ReportScreen;