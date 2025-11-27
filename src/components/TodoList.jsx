import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, InteractionManager, FlatList } from 'react-native';
import { AddTargetButton } from './AddTargetButton';
import { PlaceholderItem } from './PlaceholderItem';
import TodoDragArea, { useDraggingContext } from './dragdrop/TodoDragArea';
import DraggableTodoItem from './dragdrop/DraggableTodoItem';
import DraggableStaticItem from './dragdrop/DraggableStaticItem';

// Separate component to prevent re-renders of the parent
export const TodoList = ({
  data,
  onToggle,
  onAddPress,
  onDragEnd, // The specific DB sync function
  ListHeaderComponent,
  ListFooterComponent,
}) => {
  // 1. LOCAL STATE: We keep a local copy of data for instant UI updates
  const [localData, setLocalData] = useState(data);

  // Sync local state if the parent data changes (e.g. added new item)
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const enhancedData = useMemo(() => {
    const todos = (localData ?? []).map((todo) => ({
      ...todo,
      itemType: 'todo',
    }));

    const extras = [];

    if (todos.length === 0) {
      for (let i = 0; i < 2; i += 1) {
        extras.push({
          id: `placeholder-${i}`,
          priority: i + 1,
          itemType: 'placeholder',
        });
      }
    }

    if (onAddPress) {
      extras.push({
        id: 'add-button',
        priority: (todos[todos.length - 1]?.priority ?? 0) + 1,
        itemType: 'add-button',
      });
    }

    return [...todos, ...extras];
  }, [localData, onAddPress]);

  const handleItemDrop = useCallback(
    (itemId, absoluteY, headerOffset, rowHeight) => {
      if (!itemId || typeof absoluteY !== 'number' || typeof rowHeight !== 'number' || rowHeight === 0) {
        return;
      }

      setLocalData((current) => {
        const workingList = Array.isArray(current) ? [...current] : [];
        const fromIndex = workingList.findIndex((todo) => todo.id === itemId);

        if (fromIndex === -1) {
          return current;
        }

        const clampedHeader = typeof headerOffset === 'number' ? headerOffset : 0;
        const rawIndex = Math.floor((absoluteY - clampedHeader) / rowHeight);
        const targetIndex = Math.max(0, Math.min(workingList.length - 1, rawIndex));

        const nextList = [...workingList];
        const [moved] = nextList.splice(fromIndex, 1);
        nextList.splice(targetIndex, 0, moved);

        InteractionManager.runAfterInteractions(() => {
          const orderedIds = nextList.map((todo) => todo.id);
          onDragEnd?.(orderedIds);
        });

        return nextList;
      });
    },
    [onDragEnd]
  );

  const ListBody = () => {
    const { dragOffsetY, setHeaderHeight } = useDraggingContext();

    const renderItem = useCallback(
      ({ item, index }) => {
        if (item.itemType === 'add-button') {
          return (
            <DraggableStaticItem index={index}>
              <View style={styles.staticRow}>
                <AddTargetButton number={item.priority} onPress={onAddPress} />
              </View>
            </DraggableStaticItem>
          );
        }

        if (item.itemType === 'placeholder') {
          return (
            <DraggableStaticItem index={index}>
              <View style={styles.staticRow}>
                <PlaceholderItem number={item.priority} />
              </View>
            </DraggableStaticItem>
          );
        }

        return (
          <DraggableTodoItem
            todo={item}
            index={index}
            onToggle={onToggle}
          />
        );
      },
      [onAddPress, onToggle]
    );

    const handleScroll = useCallback(
      (event) => {
        dragOffsetY.value = event.nativeEvent.contentOffset.y;
      },
      [dragOffsetY]
    );

    const renderNode = useCallback((node) => {
      if (!node) {
        return null;
      }
      if (typeof node === 'function') {
        const Component = node;
        return <Component />;
      }
      return node;
    }, []);

    const headerContent = renderNode(ListHeaderComponent);
    const footerContent = renderNode(ListFooterComponent);

    useEffect(() => {
      if (!headerContent) {
        setHeaderHeight(0);
      }
    }, [headerContent, setHeaderHeight]);

    const headerElement = headerContent ? (
      <View
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      >
        {headerContent}
      </View>
    ) : null;

    return (
      <FlatList
        style={styles.list}
        data={enhancedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={headerElement}
        ListFooterComponent={footerContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  return (
    <View style={styles.container}>
      <TodoDragArea updateItemPosition={handleItemDrop}>
        <ListBody />
      </TodoDragArea>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent', // Ensure no background clipping
  },
  contentContainer: {
    paddingTop: 0,
    paddingBottom: 100,
    // We DO NOT put horizontal padding here. 
    // We let the Item control its own width to prevent clipping.
  },
  list: {
    flex: 1,
  },
  staticRow: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
});