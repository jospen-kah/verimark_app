import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext'; // adjust path if needed

interface ClassCardProps {
  title: string;
  time: string;
  status: string;
}

const ClassCard: React.FC<ClassCardProps> = ({ title, time, status }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={[styles.circle, { backgroundColor: theme.text }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.sub, { color: theme.text }]}>{time}</Text>
        </View>
        <Text
          style={[
            styles.status,
            status === 'Active' ? styles.active : styles.upcoming,
            { color: status === 'Active' ? '#28a745' : theme.text }
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  card: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginVertical: 5,
    alignItems: 'center',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    elevation: 2,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  title: { fontWeight: 'bold' },
  sub: { fontSize: 12 },
  status: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  active: { backgroundColor: '#defbe6' },
  upcoming: { backgroundColor: '#f0f0f0' },
});

export default ClassCard;
