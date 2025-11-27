import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/useTheme';

const DraggingTodoCard = ({ item }) => {
  const { colors } = useTheme();

  if (!item) {
    return null;
  }

  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={[`${colors.accent}CC`, `${colors.accentSecondary}DD`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <BlurView intensity={25} tint="dark" style={styles.blurContent}>
          <View style={[styles.pill, { backgroundColor: 'rgba(0,0,0,0.28)' }]}>
            <Text style={[styles.pillText, { color: '#fff' }]}>
              #{item.priority ?? item.index ?? 1}
            </Text>
          </View>
          <View style={styles.textCol}>
            <Text numberOfLines={2} style={styles.title}>
              {item.title || item.description || 'Untitled'}
            </Text>
            {item.dueDate && (
              <Text style={styles.date}>
                {new Date(item.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 16,
    padding: 1.5,
  },
  blurContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(4,16,22,0.8)',
  },
  pill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pillText: {
    fontWeight: '600',
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default DraggingTodoCard;

