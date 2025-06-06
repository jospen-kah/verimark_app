import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext'; // <-- Import the theme context

type Hall = {
  id: number;
  name: string;
  description: string;
  status: string;
};

type RootStackParamList = {
  SelectHall: undefined;
  SelectCourse: { selectedHall: Hall };
};

const SelectHallScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'SelectHall'>>();
  const [searchText, setSearchText] = useState('');
  const { theme } = useTheme(); // <-- Use the theme

  const halls = [
    {
      id: 1,
      name: 'BGFL',
      description: 'FET Building, Ground Floor',
      status: 'Available',
    },
    {
      id: 2,
      name: 'Hall 1',
      description: 'FET Building, Floor 1',
      status: 'In use',
    },
    {
      id: 3,
      name: 'Hall 2',
      description: 'FET Building, Floor 1',
      status: 'Available',
    },
    {
      id: 4,
      name: 'Techno Room 1',
      description: 'TECH Building, Ground Floor',
      status: 'In use',
    },
    {
      id: 5,
      name: 'Techno Room 5',
      description: 'TECH Building, Floor 1',
      status: 'In use',
    },
    {
      id: 6,
      name: 'Techno Room 8',
      description: 'TECH Building, Floor 1',
      status: 'In use',
    },
    {
      id: 7,
      name: 'Hall 3',
      description: 'FET Building, Floor 1',
      status: 'Available',
    },
  ];

  const handleHallSelect = (hall: Hall) => {
    if (hall.status === 'In use') {
      Alert.alert('Hall In Use', 'This hall is currently in use and cannot be selected.');
      return;
    }
    // Navigate to select course screen with selected hall data
    navigation.replace('SelectCourse', { selectedHall: hall });
  };

  const filteredHalls = halls.filter(hall =>
    hall.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Select Hall</Text>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.text + '99'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search hall by name"
          placeholderTextColor={theme.text + '99'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Halls List */}
      <ScrollView style={styles.hallsList} showsVerticalScrollIndicator={false}>
        {filteredHalls.map((hall) => (
          <TouchableOpacity
            key={hall.id}
            style={[
              styles.hallItem,
              {
                backgroundColor: theme.card,
                borderColor: hall.status === 'Available' ? '#4CAF50' : '#FF3B30',
              },
            ]}
            onPress={() => handleHallSelect(hall)}
            activeOpacity={0.7}
          >
            <View style={styles.hallInfo}>
              <Text style={[styles.hallName, { color: theme.text }]}>{hall.name}</Text>
              <Text style={[styles.hallDescription, { color: theme.text + '99' }]}>{hall.description}</Text>
            </View>
            <Text
              style={[
                styles.hallStatus,
                { color: hall.status === 'Available' ? '#4CAF50' : '#FF3B30' },
              ]}
            >
              {hall.status}
            </Text>
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
    marginBottom: 20,
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
  hallsList: {
    flex: 1,
  },
  hallItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  hallStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SelectHallScreen;