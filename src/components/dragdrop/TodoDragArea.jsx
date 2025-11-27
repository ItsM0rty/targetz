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
  setDraggingTask: () => {},
  dragY: undefined,
  dragOffsetY: undefined,
  listOffset: undefined,
  itemHeight: undefined,
  setHeaderHeight: () => {},
  setItemHeight: () => {},
});

const DEFAULT_ITEM_HEIGHT = 92;

const TodoDragArea = ({
  children,
  updateItemPosition,
}) => {
  const [draggingItem, setDraggingItem] = useState(null);
  const { width } = useWindowDimensions();

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragOffsetY = useSharedValue(0);
  const listOffset = useSharedValue(0);
  const itemHeight = useSharedValue(DEFAULT_ITEM_HEIGHT);

  const drop = () => {
    if (!draggingItem) {
      return;
    }
    updateItemPosition?.(
      draggingItem.id,
      dragY.value,
      listOffset.value,
      itemHeight.value
    );
    setDraggingItem(null);
  };

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_, stateManager) => {
      if (draggingItem) {
        stateManager.activate();
      }
    })
    .onChange((event) => {
      dragX.value = dragX.value + event.changeX;
      dragY.value = dragY.value + event.changeY;
    })
    .onEnd(() => {
      runOnJS(drop)();
    })
    .onFinalize(() => {
      runOnJS(setDraggingItem)(null);
    });

  const setDraggingTask = (item, index) => {
    if (!item) {
      return;
    }
    setDraggingItem(item);
    dragY.value = listOffset.value + index * itemHeight.value;
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
        draggingItem,
        dragOffsetY,
        listOffset,
        itemHeight,
        setHeaderHeight,
        setItemHeight,
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

