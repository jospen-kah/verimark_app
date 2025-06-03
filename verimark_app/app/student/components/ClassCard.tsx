import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ClassCardProps {
  title: string;
  time: string;
  hall: string | number;
  status: string;
}

const ClassCard: React.FC<ClassCardProps> = ({ title, time, hall, status }) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.circle} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{time}</Text>
        <Text style={styles.sub}>Hall {hall}</Text>
      </View>
      <Text style={[styles.status, status === 'Active' ? styles.active : styles.upcoming]}>
        {status}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  card: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
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
    backgroundColor: '#4f9dfc',
    marginRight: 10,
  },
  title: { fontWeight: 'bold' },
  sub: { color: '#666', fontSize: 12 },
  status: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  active: { backgroundColor: '#defbe6', color: '#28a745' },
  upcoming: { backgroundColor: '#f0f0f0', color: '#888' },
});

export default ClassCard;
