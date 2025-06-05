import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type CustomTabBarProps = BottomTabBarProps & { userRole: string };

export default function CustomTabBar({ state, descriptors, navigation, userRole }: CustomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // Example: Hide "course" tab for instructors
        if (userRole === 'instructor' && route.name === 'course') {
          return null;
        }

        // Choose icon based on route name
        let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home-outline';
        if (route.name === 'home') iconName = 'home-outline';
        if (route.name === 'attendance') iconName = 'calendar-outline';
        if (route.name === 'course') iconName = 'document-outline';
        if (route.name === 'profile') iconName = 'person-outline';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabItem}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? '#007AFF' : '#999'}
            />
            <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
              {typeof label === 'function'
                ? label({
                    focused: isFocused,
                    color: isFocused ? '#007AFF' : '#999',
                    position: 'below-icon',
                    children: route.name,
                  })
                : label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '500',
  },
});