import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TodoItem } from '../TodoItem';
import { useDraggingContext } from './TodoDragArea';

const DraggableTodoItem = ({ todo, index, onToggle }) => {
  const {
    setDraggingTask,
    dragY,
    draggingItemId,
    dragOffsetY,
    itemHeight,
    listOffset,
    setItemHeight,
  } = useDraggingContext();

  const marginTop = useSharedValue(0);

  useAnimatedReaction(
    () => ({
      dragPosition: dragY?.value ?? null,
      scrollOffset: dragOffsetY.value,
      rowHeight: itemHeight.value,
      header: listOffset.value,
    }),
    (values) => {
      if (!values.dragPosition) {
        marginTop.value = withTiming(0, { duration: 120 });
        return;
      }
      const itemY =
        index * values.rowHeight + values.header - values.scrollOffset;
      const shouldOffset =
        values.dragPosition >= itemY &&
        values.dragPosition < itemY + values.rowHeight;
      marginTop.value = withTiming(shouldOffset ? values.rowHeight : 0, {
        duration: 120,
      });
    },
    [index]
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

  const rowStyle = useAnimatedStyle(() => ({
    marginTop: marginTop.value,
    height: itemHeight.value,
  }));

  const spacerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    marginTop: marginTop.value,
  }));

  if (draggingItemId === todo.id) {
    return <Animated.View style={[styles.row, spacerStyle]} />;
  }

  return (
    <Animated.View style={[styles.row, rowStyle]} onLayout={handleLayout}>
      <TodoItem
        todo={todo}
        index={index}
        isActive={draggingItemId === todo.id}
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

