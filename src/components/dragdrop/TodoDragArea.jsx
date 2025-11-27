import React, { createContext, useContext, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import DraggingTodoCard from './DraggingTodoCard';

const DraggingContext = createContext({
  draggingItemId: null,
  draggingItem: null,
  draggingItemIndex: null,
  setDraggingTask: () => {},
  dragY: undefined,
  dragOffsetY: undefined,
  listOffset: undefined,
  itemHeight: undefined,
  setHeaderHeight: () => {},
  setItemHeight: () => {},
  hasMovedThreshold: undefined,
});

const DEFAULT_ITEM_HEIGHT = 92;

const TodoDragArea = ({
  children,
  updateItemPosition,
}) => {
  const [draggingItem, setDraggingItem] = useState(null);
  const [draggingItemIndex, setDraggingItemIndex] = useState(null);
  const { width } = useWindowDimensions();

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragOffsetY = useSharedValue(0);
  const listOffset = useSharedValue(0);
  const itemHeight = useSharedValue(DEFAULT_ITEM_HEIGHT);
  // Track the initial touch position to calculate absolute drag position
  const initialTouchY = useSharedValue(0);
  const initialItemY = useSharedValue(0);
  // Track if drag has moved enough to trigger animations (prevents sensitivity)
  const hasMovedThreshold = useSharedValue(false);

  const drop = () => {
    if (!draggingItem) {
      return;
    }
    // Calculate absolute Y position for drop calculation
    const absoluteY = dragY.value;
    updateItemPosition?.(
      draggingItem.id,
      absoluteY,
      listOffset.value,
      itemHeight.value
    );
    setDraggingItem(null);
    setDraggingItemIndex(null);
  };

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_, stateManager) => {
      if (draggingItem) {
        stateManager.activate();
      }
    })
    .onStart((event) => {
      // Capture initial touch position when drag starts
      initialTouchY.value = event.y;
      hasMovedThreshold.value = false;
    })
    .onChange((event) => {
      dragX.value = dragX.value + event.changeX;
      // Calculate absolute Y position: initial item position + touch movement
      const newY = initialItemY.value + (event.y - initialTouchY.value);
      dragY.value = newY;
      
      // Check if drag has moved enough to trigger animations (threshold: 1/3 of item height)
      const movementY = Math.abs(event.y - initialTouchY.value);
      const threshold = itemHeight.value / 3;
      if (movementY > threshold) {
        hasMovedThreshold.value = true;
      }
    })
    .onEnd(() => {
      runOnJS(drop)();
    })
    .onFinalize(() => {
      runOnJS(setDraggingItem)(null);
      runOnJS(setDraggingItemIndex)(null);
      hasMovedThreshold.value = false;
    });

  const setDraggingTask = (item, index) => {
    if (!item) {
      return;
    }
    setDraggingItem(item);
    setDraggingItemIndex(index);
    // Calculate absolute Y position of the item (accounting for header and scroll)
    const absoluteY = listOffset.value + index * itemHeight.value;
    initialItemY.value = absoluteY;
    dragY.value = absoluteY;
    dragX.value = 20;
  };

  const setHeaderHeight = (height) => {
    if (typeof height !== 'number') {
      return;
    }
    listOffset.value = height;
  };

  const setItemHeight = (height) => {
    if (typeof height !== 'number' || height <= 0) {
      return;
    }
    if (Math.abs(itemHeight.value - height) < 1) {
      return;
    }
    itemHeight.value = height;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: dragY.value - dragOffsetY.value,
      left: dragX.value,
      height: itemHeight.value,
    };
  });

  return (
    <DraggingContext.Provider
      value={{
        setDraggingTask,
        dragY: draggingItem ? dragY : undefined,
        draggingItemId: draggingItem?.id ?? null,
        draggingItemIndex,
        draggingItem,
        dragOffsetY,
        listOffset,
        itemHeight,
        setHeaderHeight,
        setItemHeight,
        hasMovedThreshold,
      }}
    >
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          {children}

          {draggingItem && (
            <Animated.View
              style={[
                animatedStyle,
                {
                  width,
                  position: 'absolute',
                  paddingHorizontal: 20,
                  paddingVertical: 6,
                  transform: [
                    {
                      rotateZ: '3deg',
                    },
                  ],
                  pointerEvents: 'none',
                },
              ]}
            >
              <DraggingTodoCard item={draggingItem} />
            </Animated.View>
          )}
        </View>
      </GestureDetector>
    </DraggingContext.Provider>
  );
};

export default TodoDragArea;

export const useDraggingContext = () => useContext(DraggingContext);

