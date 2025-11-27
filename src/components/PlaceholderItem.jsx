import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

export const PlaceholderItem = React.memo(({ number }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={[styles.numberPill, { backgroundColor: `${colors.textSecondary}15` }]}>
        <Text style={[styles.numberText, { color: colors.textSecondary, opacity: 0.4 }]}>#{number}</Text>
      </View>
      <View style={styles.textContainer}>
        <View style={[styles.greyedOutLine, { backgroundColor: colors.textSecondary, opacity: 0.2 }]} />
        <View style={[styles.greyedOutLine, styles.greyedOutLineShort, { backgroundColor: colors.textSecondary, opacity: 0.2 }]} />
      </View>
    </View>
  );
});

PlaceholderItem.displayName = 'PlaceholderItem';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginHorizontal: 0,
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.4,
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
  greyedOutLine: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  greyedOutLineShort: {
    width: '50%',
    marginBottom: 0,
  },
});

