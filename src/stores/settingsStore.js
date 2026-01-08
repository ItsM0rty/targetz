import { create } from 'zustand';
import { Appearance } from 'react-native';
import { createStorage } from '../utils/storage';

// Use AsyncStorage-based adapter (works reliably in Expo, fast with in-memory cache)
const storage = createStorage('settings');

// Debounce storage writes to batch operations and prevent blocking
let saveTimeout = null;
const DEBOUNCE_DELAY = 100; // 100ms debounce

export const useSettingsStore = create((set, get) => ({
  theme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  mode: 'free',
  monitoredApps: [],
  timeBasedInterval: 60, // 1 hour default
  appDetectionEnabled: false,
  
  loadSettings: async () => {
    try {
      // Ensure storage is initialized (loads cache)
      await storage._ensureInitialized();
      
      const theme = storage.getString('theme') || 'system';
      const mode = storage.getString('mode') || 'free';
      const monitoredAppsStr = storage.getString('monitoredApps');
      const monitoredApps = monitoredAppsStr ? JSON.parse(monitoredAppsStr) : [];
      const timeBasedInterval = storage.getNumber('timeBasedInterval') || 60;
      const appDetectionEnabled = storage.getBoolean('appDetectionEnabled') || false;
      
      set({
        theme,
        mode,
        monitoredApps,
        timeBasedInterval,
        appDetectionEnabled,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  saveSettings: () => {
    // Clear existing timeout to debounce rapid changes
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Debounce the actual write to batch rapid changes
    saveTimeout = setTimeout(() => {
      try {
        const { theme, mode, monitoredApps, timeBasedInterval, appDetectionEnabled } = get();
        // Use sync set for performance (updates cache immediately, writes async in background)
        storage.setSync('theme', theme);
        storage.setSync('mode', mode);
        storage.setSync('monitoredApps', JSON.stringify(monitoredApps));
        storage.setSync('timeBasedInterval', timeBasedInterval);
        storage.setSync('appDetectionEnabled', appDetectionEnabled);
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      saveTimeout = null;
    }, DEBOUNCE_DELAY);
  },
  
  setTheme: (theme) => {
    set({ theme });
    // Save immediately but non-blocking (setSync updates cache, writes async in background)
    get().saveSettings();
  },
  
  setMode: (mode) => {
    set({ mode });
    // Save immediately but non-blocking (setSync updates cache, writes async in background)
    get().saveSettings();
  },
  
  addMonitoredApp: (packageName) => {
    const { mode, monitoredApps } = get();
    if (packageName === '__ALL__') {
      if (mode === 'free') {
        return;
      }
      set({ monitoredApps: ['__ALL__'] });
      get().saveSettings();
      return;
    }

    if (mode === 'free' && monitoredApps.filter((app) => app !== '__ALL__').length >= 2) {
      return; // Enforce free tier limit
    }

    if (monitoredApps.includes('__ALL__')) {
      set({ monitoredApps: [packageName] });
      get().saveSettings();
      return;
    }

    if (!monitoredApps.includes(packageName)) {
      set({ monitoredApps: [...monitoredApps, packageName] });
      get().saveSettings();
    }
  },
  
  removeMonitoredApp: (packageName) => {
    set((state) => ({
      monitoredApps: state.monitoredApps.filter((app) => app !== packageName),
    }));
    get().saveSettings();
  },
  
  setTimeBasedInterval: (interval) => {
    set({ timeBasedInterval: interval });
    get().saveSettings();
  },
  
  setAppDetectionEnabled: (enabled) => {
    set({ appDetectionEnabled: enabled });
    get().saveSettings();
  },
}));

