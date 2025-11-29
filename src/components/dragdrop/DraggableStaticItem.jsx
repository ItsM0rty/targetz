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
 * The add button is always the last item, so it uses marginTop to affect layout
 */
const DraggableStaticItem = ({ children, index, isLastItem = false }) => {
  const {
    dragY,
    draggingItemId,
    draggingItemIndex,
    dragOffsetY,
    itemHeight,
    listOffset,
    hasMovedThreshold,
  } = useDraggingContext();

  // Premium conditional animation: last item (add button) uses marginTop to affect layout
  const translateY = useSharedValue(0);
  const marginTop = useSharedValue(0);

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
        marginTop.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
        return;
      }

      // Calculate target index based on drag position
      const targetIndex = Math.max(0, Math.floor((values.dragPosition - values.header) / values.rowHeight));
      const originalIndex = values.originalDragIndex;

      // Premium conditional animation: add button (last item) uses marginTop to affect layout
      const shouldShift = index >= targetIndex && index !== originalIndex;
      const shiftDistance = shouldShift ? values.rowHeight * SPACING_FACTOR : 0;

      if (isLastItem && shouldShift) {
        // Last item (add button): use marginTop to affect layout and push footer down
        marginTop.value = withTiming(shiftDistance, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
      } else {
        // Placeholders: use transform for better performance
        translateY.value = withTiming(shiftDistance, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
        marginTop.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
      }
    },
    [index, draggingItemId, draggingItemIndex, isLastItem]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    // Premium conditional animation:
    // - Last item (add button) uses marginTop when shifting (affects layout)
    // - Placeholders use transform (better performance)
    // Both animations use the same timing for consistent, polished feel
    transform: [{ translateY: translateY.value }],
    marginTop: marginTop.value,
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

