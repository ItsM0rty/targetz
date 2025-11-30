import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/useTheme';
import { useTodoStore } from '../src/stores/todoStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { TodoList } from '../src/components/TodoList';
import { AddTodoModal } from '../src/components/AddTodoModal';
import { FloatingActionButton } from '../src/components/FloatingActionButton';
import { CalendarCarousel } from '../src/components/CalendarCarousel';
import { FocusAppsCard } from '../src/components/FocusAppsCard';
import { DateHeader } from '../src/components/DateHeader';
import { requestNotificationPermissions, scheduleTimeBasedReminder } from '../src/utils/notifications';
import { startAppMonitoring, stopAppMonitoring } from '../src/utils/appMonitoring';
import { Settings as ReanimatedSettings } from 'react-native-reanimated';

if (ReanimatedSettings?.androidSynchronouslyUpdateUIProps !== undefined && Platform.OS === 'android') {
  ReanimatedSettings.androidSynchronouslyUpdateUIProps = true;
}
if (ReanimatedSettings?.iosSynchronouslyUpdateUIProps !== undefined && Platform.OS === 'ios') {
  ReanimatedSettings.iosSynchronouslyUpdateUIProps = true;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const startOfDay = (timestamp = Date.now()) => {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const formatLongDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const ReminderControls = ({
  appDetectionEnabled,
  onToggleDetection,
  timeBasedInterval,
  onChangeInterval,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.controlsCard, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
      <View style={styles.controlsHeader}>
        <Text style={[styles.controlsTitle, { color: colors.text }]}>Automation</Text>
        <Text style={[styles.controlsSubtitle, { color: colors.textSecondary }]}>Stay on track without thinking about it</Text>
      </View>
      <View style={[styles.controlRow, { borderColor: colors.border }]}> 
        <View style={styles.controlTextGroup}>
          <Text style={[styles.controlLabel, { color: colors.text }]}>App-triggered reminders</Text>
          <Text style={[styles.controlHint, { color: colors.textSecondary }]}>Buzz me when focus apps open</Text>
        </View>
        <TouchableOpacity
          style={[styles.togglePill, appDetectionEnabled && { backgroundColor: colors.accent }]}
          onPress={() => onToggleDetection(!appDetectionEnabled)}
        >
          <Text style={[styles.toggleLabel, { color: appDetectionEnabled ? '#041016' : colors.textSecondary }]}> 
            {appDetectionEnabled ? 'On' : 'Off'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.controlRow, { borderColor: colors.border }]}> 
        <View style={styles.controlTextGroup}>
          <Text style={[styles.controlLabel, { color: colors.text }]}>Hourly nudges</Text>
          <Text style={[styles.controlHint, { color: colors.textSecondary }]}>Next reminder in {timeBasedInterval / 60}h</Text>
        </View>
        <View style={styles.chipRow}>
          {[60, 120].map((minutes, index) => {
            const active = timeBasedInterval === minutes;
            return (
              <TouchableOpacity
                key={minutes}
                onPress={() => onChangeInterval(minutes)}
                style={[styles.chip, index === 0 && styles.chipSpacing, active && { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.chipLabel, { color: active ? '#041016' : colors.textSecondary }]}>{minutes / 60}h</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadTodos = useTodoStore((state) => state.loadTodos);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const reorderTodosForDate = useTodoStore((state) => state.reorderTodosForDate);
  const todosVersion = useTodoStore((state) => state.todosVersion);
  
  const {
    loadSettings,
    timeBasedInterval,
    appDetectionEnabled,
    setAppDetectionEnabled,
    setTimeBasedInterval,
  } = useSettingsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalDate, setModalDate] = useState(startOfDay());
  const [selectedDate, setSelectedDate] = useState(startOfDay());
  
  const getSeparatedTodosForDate = useTodoStore((state) => state.getSeparatedTodosForDate);
  const dateCacheRef = useRef(new Map());

  const hydrateCache = useCallback(
    (targetDate) => {
      const normalized = startOfDay(targetDate);
      const cached = dateCacheRef.current.get(normalized);
      if (cached && cached.version === todosVersion) {
        return cached.data;
      }
      const { incomplete, completed } = getSeparatedTodosForDate(normalized);
      const merged = [...incomplete, ...completed];
      dateCacheRef.current.set(normalized, { version: todosVersion, data: merged });
      return merged;
    },
    [getSeparatedTodosForDate, todosVersion]
  );

  // Optimized: cached lookup with prefetched neighbors
  const tasksForSelectedDay = useMemo(
    () => hydrateCache(selectedDate),
    [selectedDate, hydrateCache]
  );

  useEffect(() => {
    const neighbors = [selectedDate - DAY_IN_MS, selectedDate + DAY_IN_MS];
    neighbors.forEach((neighbor) => hydrateCache(neighbor));
    const MAX_CACHE_ENTRIES = 7;
    const cache = dateCacheRef.current;
    if (cache.size > MAX_CACHE_ENTRIES) {
      const keys = Array.from(cache.keys());
      while (keys.length > MAX_CACHE_ENTRIES) {
        const oldestKey = keys.shift();
        cache.delete(oldestKey);
      }
    }
  }, [selectedDate, hydrateCache]);
  
  useEffect(() => {
    Promise.all([
      loadTodos(),
      loadSettings(),
    ]).catch(console.error);

    requestNotificationPermissions().then((granted) => {
      if (granted && appDetectionEnabled) {
        scheduleTimeBasedReminder(timeBasedInterval);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scheduleTimeBasedReminder(timeBasedInterval);
  }, [timeBasedInterval]);



  const openModalForDate = useCallback((dateValue) => {
    setModalDate(startOfDay(dateValue || Date.now()));
    setModalVisible(true);
  }, []);

  const handleToggleDetection = useCallback(
    async (enabled) => {
      setAppDetectionEnabled(enabled);
      if (enabled) {
        const notificationGranted = await requestNotificationPermissions();
        if (notificationGranted) {
          scheduleTimeBasedReminder(timeBasedInterval);
          await startAppMonitoring();
        }
      } else {
        stopAppMonitoring();
      }
    },
    [setAppDetectionEnabled, timeBasedInterval]
  );

  const handleReorder = useCallback(
    (orderedIds) => {
      // orderedIds is already an array of IDs from TodoList
      reorderTodosForDate(selectedDate, orderedIds);
    },
    [reorderTodosForDate, selectedDate]
  );

  const headerComponent = useMemo(
    () => (
      <View style={styles.listHeader}>
        {/* App Title Bar - Perplexity style */}
        <View style={[styles.appHeader, { borderBottomColor: colors.border }]}>
          <Image 
            source={require('../assets/header.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity 
            onPress={() => router.push('/settings')} 
            style={[styles.settingsButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
          > 
            <Text style={[styles.settingsIcon, { color: colors.textSecondary }]}>⚙️</Text>
          </TouchableOpacity>
        </View>
        
        {/* Separate Date Header */}
        <DateHeader selectedDate={selectedDate} />
        
        {/* Spacing between date navigator and target list */}
        <View style={styles.listSpacing} />
      </View>
    ),
    [
      colors,
      router,
      selectedDate,
    ]
  );


  // Footer component with all sections below the list
  const footerComponent = useMemo(
    () => (
      <View>
        {/* Calendar Section - Full Width */}
        <View style={styles.calendarSectionWrapper}>
          <CalendarCarousel
            selectedDate={selectedDate}
            onSelectDate={(dateValue) => setSelectedDate(dateValue)}
            onAddPress={() => openModalForDate(selectedDate)}
          />
        </View>

        {/* Focus Apps Section */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <FocusAppsCard />
          </View>
        </View>

        {/* Automation Section */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <ReminderControls
              appDetectionEnabled={appDetectionEnabled}
              onToggleDetection={handleToggleDetection}
              timeBasedInterval={timeBasedInterval}
              onChangeInterval={(minutes) => {
                setTimeBasedInterval(minutes);
                scheduleTimeBasedReminder(minutes);
              }}
            />
          </View>
        </View>

        <View style={{ height: insets.bottom + 140 }} />
      </View>
    ),
    [
      selectedDate,
      openModalForDate,
      appDetectionEnabled,
      handleToggleDetection,
      timeBasedInterval,
      setTimeBasedInterval,
      scheduleTimeBasedReminder,
      insets.bottom,
    ]
  );

  return (
    <View style={[styles.gradient, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <TodoList
          data={tasksForSelectedDay}
          onToggle={toggleTodo}
          onAddPress={() => openModalForDate(selectedDate)}
          onDragEnd={handleReorder}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={footerComponent}
        />
      </View>

      <FloatingActionButton onPress={() => openModalForDate(selectedDate)} />

      <AddTodoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialDate={modalDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  listHeader: {
    paddingBottom: 16,
    width: '100%',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    marginTop: -15,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  headerLogo: {
    height: 75,
    width: 150,
    marginBottom: -10,
    marginLeft: 5,
    
    },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 25,
  },
  settingsIcon: {
    fontSize: 18,
  },
  section: {
    marginBottom: 20,
    width: '100%',
  },
  sectionContent: {
    paddingHorizontal: 20,
    width: '100%',
  },
  calendarSection: {
    marginTop: 24,
  },
  calendarSectionWrapper: {
    marginTop: 4,
    marginBottom: 20,
    width: '100%',
    alignSelf: 'stretch',
  },
  listSpacing: {
    height: 24,
  },
  controlsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  controlsHeader: {
    marginBottom: 16,
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  controlsSubtitle: {
    fontSize: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  controlTextGroup: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlHint: {
    fontSize: 12,
    marginTop: 4,
  },
  togglePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.24)',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  chipSpacing: {
    marginRight: 12,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  listGradient: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  listContainer: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
});

