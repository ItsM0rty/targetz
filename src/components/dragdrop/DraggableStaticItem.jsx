import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useDraggingContext } from './TodoDragArea';

// Premium bezier easing curve for smooth, natural motion
// Custom curve: smooth acceleration, gentle deceleration (premium feel)
const PREMIUM_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

// Animation duration: 200ms provides responsive feel while maintaining smoothness
const ANIMATION_DURATION = 200;

// Spacing factor: 52% provides optimal balance - tight enough to feel cohesive,
// spacious enough to clearly indicate insertion point
const SPACING_FACTOR = 0.52;

/**
 * Wrapper component for static items (like add button) that need to respond to drag animations
 */
const DraggableStaticItem = ({ children, index }) => {
  const {
    dragY,
    draggingItemId,
    draggingItemIndex,
    dragOffsetY,
    itemHeight,
    listOffset,
    hasMovedThreshold,
  } = useDraggingContext();

  // Use translateY instead of marginTop for better GPU acceleration and smoother animations
  const translateY = useSharedValue(0);

  useAnimatedReaction(
    () => ({
      dragPosition: dragY?.value ?? null,
      scrollOffset: dragOffsetY.value,
      rowHeight: itemHeight.value,
      header: listOffset.value,
      originalDragIndex: draggingItemIndex,
      hasMoved: hasMovedThreshold?.value ?? false,
    }),
    (values) => {
      // Only shift if drag has moved past threshold
      if (!values.dragPosition || values.originalDragIndex === null || !values.hasMoved) {
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
        return;
      }

      // Calculate target index based on drag position
      const targetIndex = Math.max(0, Math.floor((values.dragPosition - values.header) / values.rowHeight));
      const originalIndex = values.originalDragIndex;

      // Shift down if at or below target position (same logic as DraggableTodoItem)
      // Using transform translateY for GPU acceleration and smoother performance
      if (index >= targetIndex && index !== originalIndex) {
        const shiftDistance = values.rowHeight * SPACING_FACTOR;
        translateY.value = withTiming(shiftDistance, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
      } else {
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
      }
    },
    [index, draggingItemId, draggingItemIndex]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    // Use transform instead of marginTop for better performance and smoother animations
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default DraggableStaticItem;

