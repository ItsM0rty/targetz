import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

export const FloatingActionButton = ({ onPress }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + 24 }]}
    >
      <LinearGradient
        colors={[colors.accent, colors.accentSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.icon}>+</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 24,
  },
  container: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 28,
  },
});

