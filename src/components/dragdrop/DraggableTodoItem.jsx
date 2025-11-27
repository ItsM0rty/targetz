import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { TodoItem } from '../TodoItem';
import { useDraggingContext } from './TodoDragArea';

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
      // Don't animate marginTop for the item being dragged
      if (values.isDraggingThis) {
        marginTop.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        return;
      }
      
      // Only shift items if drag has moved past threshold (prevents sensitivity on initial press)
      if (!values.dragPosition || values.originalDragIndex === null || !values.hasMoved) {
        marginTop.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        return;
      }
      
      // Calculate target index based on drag position
      // This determines where the dragged item would be inserted
      const targetIndex = Math.max(0, Math.floor((values.dragPosition - values.header) / values.rowHeight));
      const originalIndex = values.originalDragIndex;
      
      // Fluid drag-and-drop animation:
      // Items at or below the target index shift DOWN to make space (except the original item)
      // Items above the target index don't shift
      
      if (index >= targetIndex && index !== originalIndex) {
        // This item is at or below the target position (and not the original) - shift it down
        marginTop.value = withSpring(values.rowHeight, {
          damping: 15,
          stiffness: 150,
        });
      } else {
        // This item is above the target position or is the original - no shift needed
        marginTop.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }
    },
    [index, todo.id, draggingItemId, draggingItemIndex]
  );

  useEffect(() => {
    if (!draggingItemId) {
      marginTop.value = 0;
    }
  }, [draggingItemId, marginTop]);

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
    marginTop: marginTop.value,
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

