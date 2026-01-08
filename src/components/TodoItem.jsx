import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  Easing,
  interpolate, 
  useDerivedValue
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';

// Helper to simplify Date logic
const getDueDateLabel = (dateMs) => {
  const d = new Date(dateMs);
  const now = new Date();
  d.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  const diff = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
  
  if (diff === 0) return 'Today';
  if (diff === 1) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const TodoItem = React.memo(({ 
  todo, 
  index, 
  isActive, 
  onLongPress,
  onToggle 
}) => {
  const { colors } = useTheme();
  
  // Memoize gradient colors to prevent recreation
  const gradientColors = useMemo(() => {
    const isHighlighted = index === 0 && !todo.done && !isActive;
    return isHighlighted 
      ? [colors.accent, colors.accentSecondary] 
      : [`${colors.accent}20`, colors.border];
  }, [index, todo.done, isActive, colors.accent, colors.accentSecondary, colors.border]);
  
  // 1. ANIMATION DRIVER
  // Premium bezier easing for smooth, natural lift effect
  // Matches the drag animation timing for cohesive feel
  const LIFT_EASING = Easing.bezier(0.34, 1.56, 0.64, 1); // Slight overshoot for premium feel
  const LIFT_DURATION = 220; // Slightly longer for lift to feel more deliberate

  // We drive the animation purely off the boolean 'isActive'
  const activeValue = useDerivedValue(() => {
    return withTiming(isActive ? 1 : 0, {
      duration: LIFT_DURATION,
      easing: LIFT_EASING,
    });
  }, [isActive]);

  // 2. THE "LIFT" EFFECT
  // Premium lift effect with enhanced visual feedback for active drag state
  // Subtle scale and elevation create a premium, polished feel
  const rContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(activeValue.value, [0, 1], [1, 1.05]);
    const yOffset = interpolate(activeValue.value, [0, 1], [0, -7]);
    
    return {
      transform: [
        { scale },
        { translateY: yOffset }
      ],
      zIndex: isActive ? 999 : 1, // Force to top
      shadowOpacity: interpolate(activeValue.value, [0, 1], [0, 0.4]),
    };
  });

  const number = todo.priority || index + 1;
  const isHighlighted = index === 0 && !todo.done && !isActive;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.animatedInner, rContainerStyle]}>
        {/* 3. TOUCH HANDLING
           We wrap the entire visual card in Pressable.
           onLongPress triggers 'drag', which we passed down.
        */}
        <Pressable
          onPress={isActive ? null : onToggle}
          onLongPress={onLongPress}
          delayLongPress={250} // Matches List activation time
          disabled={isActive}
          style={({ pressed }) => [
            styles.cardContainer,
            { opacity: pressed && !isActive ? 0.8 : 1 } // Simple tap feedback
          ]}
        >
          <LinearGradient
             colors={gradientColors}
             start={{x: 0, y: 0}} end={{x: 1, y: 1}}
             style={styles.gradientBorder}
          >
            {/* Replaced BlurView with View for better performance */}
            <View style={[styles.content, { backgroundColor: colors.surface }]}>
              
              {/* Priority Pill */}
              <View style={styles.pill}>
                <Text style={[styles.pillText, { color: colors.accentSecondary }]}>
                  #{number}
                </Text>
              </View>

              {/* Text Content */}
              <View style={styles.textCol}>
                <Text 
                  selectable={false} // Prevents OS Popup
                  numberOfLines={2} 
                  style={[
                    styles.title, 
                    todo.done && { textDecorationLine: 'line-through', color: colors.textSecondary },
                    { color: isHighlighted ? '#FFFFFF' : colors.text }
                  ]}
                >
                  {todo.title}
                </Text>
              </View>

            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  // 4. THE CLIPPING FIX
  // The 'wrapper' provides invisible padding. The Item sits inside it.
  // If the item scales up, it scales INTO this padding, not off the screen.
  wrapper: {
    width: '100%',
    paddingHorizontal: 20, // Global Horizontal Padding for the list
    paddingVertical: 6,
  },
  animatedInner: {
    // This is the layer that scales/moves
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 6.27,
    elevation: 10,
  },
  cardContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden', // Ensures content respects rounded corners
  },
  gradientBorder: {
    padding: 1.5, // Thickness of border
    borderRadius: 16,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14, // Slightly less than gradient to fit inside
  },
  pill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pillText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

