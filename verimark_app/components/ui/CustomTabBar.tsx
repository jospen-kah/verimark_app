import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../ThemeContext';

interface CustomTabBarProps extends BottomTabBarProps {
  userRole: string;
  theme?: {
    background: string;
    text: string;
    card: string;
  };
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  userRole,
  theme: themeProp,
}: CustomTabBarProps) {
  const context = useTheme ? useTheme() : undefined;
  const theme = themeProp || (context ? context.theme : {
    background: '#fff',
    text: '#333',
    card: '#F5F5F5',
  });

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.card,
          borderTopColor: theme.text + '22',
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        if (userRole === 'instructor' && route.name === 'course') {
          return null;
        }

        let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home-outline';
        if (route.name === 'home') iconName = 'home-outline';
        if (route.name === 'attendance') iconName = 'calendar-outline';
        if (route.name === 'course') iconName = 'document-outline';
        if (route.name === 'profile') iconName = 'person-outline';

        const color = isFocused ? theme.text : theme.text + '99';

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
              color={color}
            />
            <Text
              style={[
                styles.tabLabel,
                { color },
                isFocused && styles.activeTabLabel,
              ]}
            >
              {typeof label === 'function'
                ? label({
                    focused: isFocused,
                    color,
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
    borderTopWidth: 1,
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
    marginTop: 2,
  },
  activeTabLabel: {
    fontWeight: '500',
  },
});