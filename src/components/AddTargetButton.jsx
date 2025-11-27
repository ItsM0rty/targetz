import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

export const AddTargetButton = React.memo(({ number, onPress }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.numberPill, { backgroundColor: `${colors.accent}20` }]}>
        <Text style={[styles.numberText, { color: colors.accent }]}>#{number}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.addButtonText, { color: colors.accent }]}>Add another target</Text>
      </View>
    </TouchableOpacity>
  );
});

AddTargetButton.displayName = 'AddTargetButton';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginHorizontal: 0,
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberPill: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  textContainer: {
    flex: 1,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

