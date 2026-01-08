import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
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

const DraggableTodoItem = ({ todo, index, onToggle, isLastTodo = false }) => {
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

  // Premium conditional animation: use marginTop for last item when shifting (affects layout),
  // transform for all other items (better performance)
  const translateY = useSharedValue(0);
  const marginTop = useSharedValue(0);

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
      // Don't animate for the item being dragged
      if (values.isDraggingThis) {
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
      
      // Only shift items if drag has moved past threshold (prevents sensitivity on initial press)
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
      // This determines where the dragged item would be inserted
      const targetIndex = Math.max(0, Math.floor((values.dragPosition - values.header) / values.rowHeight));
      const originalIndex = values.originalDragIndex;
      
      // Premium conditional drag-and-drop animation:
      // - Last item uses marginTop when shifting (affects layout, prevents footer overlap)
      // - All other items use transform translateY (better GPU performance)
      // - Items at or below the target index shift DOWN to make space (except the original item)
      
      const shouldShift = index >= targetIndex && index !== originalIndex;
      const shiftDistance = shouldShift ? values.rowHeight * SPACING_FACTOR : 0;
      
      if (isLastTodo && shouldShift) {
        // Last item: use marginTop to affect layout and push footer down
        marginTop.value = withTiming(shiftDistance, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: PREMIUM_EASING,
        });
      } else {
        // All other items: use transform for better performance
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
    [index, todo.id, draggingItemId, draggingItemIndex, isLastTodo]
  );

  useEffect(() => {
    if (!draggingItemId) {
      translateY.value = 0;
      marginTop.value = 0;
    }
  }, [draggingItemId, translateY, marginTop]);

  const itemRef = useRef(null);

  const handleLongPress = useCallback(() => {
    // Measure the actual screen position of the item when drag starts
    // This ensures correct positioning regardless of scroll position
    if (itemRef.current) {
      itemRef.current.measure((x, y, width, height, pageX, pageY) => {
        // pageY is the absolute screen position
        setDraggingTask(todo, index, pageY);
      });
    } else {
      // Fallback to calculated position if measure fails
      setDraggingTask(todo, index);
    }
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
    // Premium conditional animation:
    // - Last item uses marginTop when shifting (affects layout)
    // - All other items use transform (better performance)
    // Both animations use the same timing for consistent, polished feel
    transform: [{ translateY: translateY.value }],
    marginTop: marginTop.value,
    height: itemHeight.value,
    // Make item invisible when dragging, but keep it in layout
    opacity: isDragging ? 0 : 1,
  }));

  return (
    <View ref={itemRef} collapsable={false}>
      <Animated.View style={[styles.row, rowStyle]} onLayout={handleLayout}>
        <TodoItem
          todo={todo}
          index={index}
          isActive={isDragging}
          onLongPress={handleLongPress}
          onToggle={() => onToggle(todo.id)}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
  },
});

export default DraggableTodoItem;

