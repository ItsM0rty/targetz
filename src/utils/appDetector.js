import { NativeModules, Platform } from 'react-native';

const { AppDetector } = NativeModules;
const isAndroid = Platform.OS === 'android';
const moduleAvailable = !!AppDetector;
let hasWarnedMissingModule = false;

if (__DEV__ && isAndroid && !moduleAvailable && !hasWarnedMissingModule) {
  console.warn('[AppDetector] Native module not found. App-triggered reminders are disabled in development builds.');
  hasWarnedMissingModule = true;
}

const safeCall = async (method, fallback) => {
  if (!isAndroid) {
    return fallback;
  }
  if (!moduleAvailable || typeof AppDetector[method] !== 'function') {
    return fallback;
  }
  try {
    return await AppDetector[method]();
  } catch (error) {
    console.warn(`[AppDetector] Failed to execute ${method}:`, error);
    return fallback;
  }
};

export async function requestUsagePermission() {
  return safeCall('requestUsagePermission', undefined);
}

export async function hasUsagePermission() {
  return safeCall('hasUsagePermission', false);
}

export async function getCurrentApp() {
  return safeCall('getCurrentApp', '');
}

