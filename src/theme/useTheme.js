import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { colors } from './colors';

// Memoize colors objects to prevent recreation on every render
const colorsCache = {
  light: colors.light,
  dark: colors.dark,
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  // Use selector to only subscribe to theme changes, not entire store
  const theme = useSettingsStore((state) => state.theme);
  
  const effectiveTheme = useMemo(
    () => (theme === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : theme),
    [theme, systemColorScheme]
  );
  
  // Return memoized values to prevent unnecessary re-renders
  return useMemo(
    () => ({
      colors: colorsCache[effectiveTheme],
      isDark: effectiveTheme === 'dark',
      theme: effectiveTheme,
    }),
    [effectiveTheme]
  );
}

