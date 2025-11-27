import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { getCurrentApp } from './appDetector';
import { useSettingsStore } from '../stores/settingsStore';
import { triggerAppDetectedReminder } from './notifications';

const { AppDetector } = NativeModules;
const eventEmitter = AppDetector ? new NativeEventEmitter(AppDetector) : null;

let monitoringInterval = null;
let lastDetectedApp = '';

/**
 * Start monitoring apps using polling (since WorkManager minimum is 15 minutes)
 * We'll poll every 3 seconds for better UX
 */
export async function startAppMonitoring() {
  if (Platform.OS !== 'android' || !AppDetector) {
    return;
  }
  
  const { monitoredApps, appDetectionEnabled } = useSettingsStore.getState();
  
  if (!appDetectionEnabled || monitoredApps.length === 0) {
    return;
  }
  
  // Stop existing monitoring
  stopAppMonitoring();
  
  // Start polling every 3 seconds
  monitoringInterval = setInterval(async () => {
    try {
      const currentApp = await getCurrentApp();
      const activeApps = useSettingsStore.getState().monitoredApps;
      
      // Only trigger if app changed and is in monitored list
      if (currentApp && currentApp !== lastDetectedApp && activeApps.includes(currentApp)) {
        lastDetectedApp = currentApp;
        await triggerAppDetectedReminder();
      }
    } catch (error) {
      console.error('Error monitoring apps:', error);
    }
  }, 3000); // 3 seconds polling interval
}

/**
 * Stop app monitoring
 */
export function stopAppMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  lastDetectedApp = '';
}

/**
 * Restart monitoring when settings change
 */
export function restartAppMonitoring() {
  stopAppMonitoring();
  startAppMonitoring();
}

