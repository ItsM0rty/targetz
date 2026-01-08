import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/useTheme';
import { useTodoStore } from '../stores/todoStore';
import DateTimePicker from '@react-native-community/datetimepicker';

const startOfDay = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const getInitialOption = (targetDate) => {
  const today = startOfDay();
  const tomorrow = startOfDay(Date.now() + 24 * 60 * 60 * 1000);
  if (targetDate === today) return 'today';
  if (targetDate === tomorrow) return 'tomorrow';
  return 'custom';
};

export const AddTodoModal = ({ visible, onClose, initialDate }) => {
  const { colors, isDark } = useTheme();
  // Use selective subscriptions to prevent re-renders on unrelated store changes
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(startOfDay(initialDate || Date.now()));
  const [selectedOption, setSelectedOption] = useState('today');
  const [showPicker, setShowPicker] = useState(false);
  
  useEffect(() => {
    if (visible) {
      const presetDate = startOfDay(initialDate || Date.now());
      setSelectedDate(presetDate);
      setSelectedOption(getInitialOption(presetDate));
      setTimeout(() => {
        setShowPicker(false);
      }, 0);
    }
  }, [visible, initialDate]);
  
  const handleAdd = () => {
    if (title.trim()) {
      const maxPriority = todos.length > 0 
        ? Math.max(...todos.map(t => t.priority)) + 1 
        : 0;
      
      addTodo({
        title: title.trim(),
        done: false,
        priority: maxPriority,
        dueDate: selectedDate,
      });
      
      setTitle('');
      setSelectedOption('today');
      setSelectedDate(startOfDay());
      onClose();
    }
  };
  
  const handleSelectOption = (option) => {
    setSelectedOption(option);
    if (option === 'today') {
      setSelectedDate(startOfDay());
    } else if (option === 'tomorrow') {
      setSelectedDate(startOfDay(Date.now() + 24 * 60 * 60 * 1000));
    } else if (option === 'custom') {
      setShowPicker(true);
    }
  };
  
  const handleDateChange = (_, dateValue) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (dateValue) {
      const normalized = startOfDay(dateValue.getTime());
      setSelectedDate(normalized);
      setSelectedOption(getInitialOption(normalized));
    }
  };
  
  const formattedDate = new Date(selectedDate).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <BlurView tint={isDark ? 'dark' : 'light'} intensity={40} style={styles.backdropBlur} pointerEvents="none" />
        <Pressable style={styles.backdrop} onPress={onClose} />
        <MotiView
          from={{ translateY: 320, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: 280, opacity: 0 }}
          transition={{ type: 'timing', duration: 220 }}
          style={styles.sheetContainer}
        >
          <LinearGradient colors={[`${colors.accent}1F`, `${colors.border}`]} style={styles.sheetGradient}>
            <BlurView
              intensity={isDark ? 28 : 18}
              tint={isDark ? 'dark' : 'light'}
              style={[styles.modal, { backgroundColor: colors.surface }]}
            >
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Add New Target</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border }]}
                placeholder="What's your target?"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                autoFocus
                multiline
              />
              
              <View style={styles.dateSelector}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
                <View style={styles.dateButtons}>
                  {[
                    { key: 'today', label: 'Today' },
                    { key: 'tomorrow', label: 'Tomorrow' },
                    { key: 'custom', label: 'Pick date' },
                  ].map((option, index) => {
                    const isActive = selectedOption === option.key;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        onPress={() => handleSelectOption(option.key)}
                        style={[
                          styles.dateButton,
                          index !== 2 && styles.dateButtonSpacing,
                          { borderColor: colors.border },
                          isActive && { backgroundColor: option.key === 'custom' ? colors.accentSecondary : colors.accent }
                        ]}
                      >
                        <Text
                          style={[
                            styles.dateButtonText,
                            { color: isActive ? '#041016' : colors.text }
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.selectedDateRow}>
                  <Text style={[styles.selectedDateText, { color: colors.text }]}>{formattedDate}</Text>
                  {selectedOption === 'custom' && !showPicker && (
                    <TouchableOpacity onPress={() => setShowPicker(true)}>
                      <Text style={[styles.calendarLink, { color: colors.accent }]}>Change</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {showPicker && (
                  <DateTimePicker
                    value={new Date(selectedDate)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    themeVariant={isDark ? 'dark' : 'light'}
                  />
                )}
              </View>
              
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.accent }]}
                onPress={handleAdd}
              >
                <Text style={styles.addButtonText}>Add Target</Text>
              </TouchableOpacity>
            </BlurView>
          </LinearGradient>
        </MotiView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 21, 0.6)',
  },
  sheetContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
  },
  sheetGradient: {
    borderRadius: 28,
    padding: 1,
  },
  modal: {
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '300',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  dateSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dateButtons: {
    flexDirection: 'row',
  },
  dateButton: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateButtonSpacing: {
    marginRight: 12,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  selectedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calendarLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

