import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../../ThemeContext'; // adjust path as needed

const AppAppearance = () => {
  const { darkMode, setDarkMode, theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>App Appearance</Text>

      {/* Dark Mode */}
      <View style={[styles.row, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          thumbColor={darkMode ? "#007AFF" : "#ccc"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: 'center',
    marginVertical: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AppAppearance;