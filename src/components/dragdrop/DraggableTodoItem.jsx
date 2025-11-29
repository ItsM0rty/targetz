import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TodoItem } from '../TodoItem';
import { useDraggingContext } from './TodoDragArea';

// Premium bezier easing curve for smooth, natural motion
// Custom curve: smooth acceleration, gentle deceleration (premium feel)
const PREMIUM_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

// Animation duration: 200ms provides responsive feel while maintaining smoothness
const ANIMATION_DURATION = 200;

// Spacing factor: 52% provides optimal balance - tight enough to feel cohesive,
// spacious enough to clearly indicate insertion point
const SPACING_FACTOR = 0.52;

const DraggableTodoItem = ({ todo, index, onToggle }) => {
  const {
    setDraggingTask,
    dragY,
    draggingItemId,
    draggingItemIndex,
    dragOffsetY,
    itemHeight,
    listOffset,
    setItemHeight,
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
      isDraggingThis: draggingItemId === todo.id,
      originalDragIndex: draggingItemIndex,
      hasMoved: hasMovedThreshold?.value ?? false,
    }),
    (values) => {
      // Don't animate translateY for the item being dragged
      if (values.isDraggingThis) {
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
        return;
      }
      
      // Only shift items if drag has moved past threshold (prevents sensitivity on initial press)
      if (!values.dragPosition || values.originalDragIndex === null || !values.hasMoved) {
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
        return;
      }
      
      // Calculate target index based on drag position
      // This determines where the dragged item would be inserted
      const targetIndex = Math.max(0, Math.floor((values.dragPosition - values.header) / values.rowHeight));
      const originalIndex = values.originalDragIndex;
      
      // Premium drag-and-drop animation:
      // Items at or below the target index shift DOWN to make space (except the original item)
      // Items above the target index don't shift
      // Using transform translateY for GPU acceleration and smoother performance
      
      if (index >= targetIndex && index !== originalIndex) {
        // This item is at or below the target position (and not the original) - shift it down
        const shiftDistance = values.rowHeight * SPACING_FACTOR;
        translateY.value = withTiming(shiftDistance, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
      } else {
        // This item is above the target position or is the original - no shift needed
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
      }
    },
    [index, todo.id, draggingItemId, draggingItemIndex]
  );

  useEffect(() => {
    if (!draggingItemId) {
      translateY.value = 0;
    }
  }, [draggingItemId, translateY]);

  const handleLongPress = useCallback(() => {
    setDraggingTask(todo, index);
  }, [index, setDraggingTask, todo]);

  const handleLayout = useCallback(
    (event) => {
      const height = event.nativeEvent.layout.height;
      setItemHeight(height);
    },
    [setItemHeight]
  );

  const isDragging = draggingItemId === todo.id;

  const rowStyle = useAnimatedStyle(() => ({
    // Use transform instead of marginTop for better performance and smoother animations
    transform: [{ translateY: translateY.value }],
    height: itemHeight.value,
    // Make item invisible when dragging, but keep it in layout
    opacity: isDragging ? 0 : 1,
  }));

  return (
    <Animated.View style={[styles.row, rowStyle]} onLayout={handleLayout}>
      <TodoItem
        todo={todo}
        index={index}
        isActive={isDragging}
        onLongPress={handleLongPress}
        onToggle={() => onToggle(todo.id)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
  },
});

export default DraggableTodoItem;

