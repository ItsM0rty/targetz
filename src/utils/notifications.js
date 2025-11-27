import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useTodoStore } from '../stores/todoStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#32DAC3',
    });
  }
  
  return finalStatus === 'granted';
}

export async function scheduleTimeBasedReminder(intervalMinutes) {
  const todoStore = useTodoStore.getState();
  const nextTodo = todoStore.getNextIncompleteTodo();
  
  if (!nextTodo) {
    // Cancel all scheduled reminders if no todos
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }
  
  // Cancel existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Schedule new recurring reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Complete Your Task! 🎯",
      body: nextTodo.title,
      data: { todoId: nextTodo.id },
      sound: true,
    },
    trigger: {
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });
}

export async function triggerAppDetectedReminder() {
  const todoStore = useTodoStore.getState();
  const nextTodo = todoStore.getNextIncompleteTodo();
  
  if (!nextTodo) {
    return;
  }
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Complete Your Task! 🎯",
      body: nextTodo.title,
      data: { todoId: nextTodo.id },
      sound: true,
    },
    trigger: null, // Immediate
  });
}

