import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

const startOfDay = (timestamp = Date.now()) => {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const formatLongDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const DateHeader = ({ selectedDate }) => {
  const { colors } = useTheme();
  
  const dateHeading = selectedDate === startOfDay() 
    ? "Today's Targets" 
    : `Targets for ${formatLongDate(selectedDate)}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{dateHeading}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});

