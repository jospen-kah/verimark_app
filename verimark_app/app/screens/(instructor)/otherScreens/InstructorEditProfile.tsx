import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme context

const TITLES = [
  'Prof.',
  'Dr.',
  'Sir',
  'Mr.',
  'Mrs.',
  'Ms.',
  'Miss',
  'Madam',
  'Engr.',
  'Rev.',
  'Pastor',
  'Chief',
  'Alhaji',
  'Barr.',
  'Hon.',
];

const InstructorEditProfile = () => {
  const [name, setName] = useState('Dr. Johnson');
  const [title, setTitle] = useState('Dr.');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { theme } = useTheme(); // <-- Use the theme

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Save logic here (e.g., send to backend)
    alert('Profile updated!');
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>

      {/* Profile Image */}
      <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require('../../../../assets/images/profile.jpg')
          }
          style={styles.image}
        />
        <View style={styles.editIcon}>
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Name Input */}
      <Text style={[styles.label, { color: theme.text }]}>Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '22' }]}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor={theme.text + '99'}
      />

      {/* Title Dropdown */}
      <Text style={[styles.label, { color: theme.text }]}>Title</Text>
      <View style={[styles.pickerWrapper, { backgroundColor: theme.card, borderColor: theme.text + '22' }]}>
        <Picker
          selectedValue={title}
          onValueChange={setTitle}
          style={[styles.picker, { color: theme.text }]}
          dropdownIconColor={theme.text}
        >
          {TITLES.map((t) => (
            <Picker.Item key={t} label={t} value={t} color={theme.text} />
          ))}
        </Picker>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight || 40,
  },
  backIcon: {
    position: 'absolute',
    top: StatusBar.currentHeight || 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 30,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 18,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default InstructorEditProfile;