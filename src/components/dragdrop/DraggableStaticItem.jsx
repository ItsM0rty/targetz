import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useDraggingContext } from './TodoDragArea';

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
        marginTop.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        return;
      }

      // Calculate target index based on drag position
      const targetIndex = Math.max(0, Math.floor((values.dragPosition - values.header) / values.rowHeight));
      const originalIndex = values.originalDragIndex;

      // Shift down if at or below target position (same logic as DraggableTodoItem)
      if (index >= targetIndex && index !== originalIndex) {
        marginTop.value = withSpring(values.rowHeight, {
          damping: 15,
          stiffness: 150,
        });
      } else {
        marginTop.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }
    },
    [index, draggingItemId, draggingItemIndex]
  );

  const animatedStyle = useAnimatedStyle(() => ({
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

