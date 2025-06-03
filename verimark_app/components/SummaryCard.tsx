import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryCardProps {
  label: string;
  value: string;
  valueColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, valueColor }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor || '#000' }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAF1FB',
    padding: 16,
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SummaryCard;
