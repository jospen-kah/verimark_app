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
import { router, useLocalSearchParams } from 'expo-router';

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
  const params = useLocalSearchParams();
  const selectedHall = params.selectedHall ? JSON.parse(params.selectedHall as string) : null;
  const [searchText, setSearchText] = useState('');

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
    // Navigate to select course screen with selected hall data using expo-router
    router.push({
      pathname: '/screens/(instructor)/otherScreens/CourseSelection',
      params: { selectedHall: JSON.stringify(hall) },
    });
  };

  const filteredHalls = halls.filter(hall =>
    hall.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Select Hall</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hall by name"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Halls List */}
      <ScrollView style={styles.hallsList} showsVerticalScrollIndicator={false}>
        {filteredHalls.map((hall) => (
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
            <Text
              style={[
                styles.hallStatus,
                {
                  color: hall.status === 'Available' ? '#4CAF50' : '#FF3B30',
                },
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
    marginBottom: 20,
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
  hallsList: {
    flex: 1,
  },
  hallItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  hallStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SelectHallScreen;