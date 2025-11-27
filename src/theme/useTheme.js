import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { colors } from './colors';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { theme } = useSettingsStore();
  
  const effectiveTheme =
    theme === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : theme;
  
  return {
    colors: colors[effectiveTheme],
    isDark: effectiveTheme === 'dark',
    theme: effectiveTheme,
  };
}

