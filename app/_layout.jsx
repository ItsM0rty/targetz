import 'react-native-gesture-handler'; // MUST be first import
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useTheme } from '../src/theme/useTheme';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { Text, TextInput } from 'react-native';

// Note: Remote debugging should be disabled manually via dev menu
// The DevSettings API is not available in all React Native versions

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadSettings } = useSettingsStore();
  const { isDark } = useTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  
  useEffect(() => {
    loadSettings().catch(console.error);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = [Text.defaultProps.style, { fontFamily: 'Inter_500Medium' }];
      TextInput.defaultProps = TextInput.defaultProps || {};
      TextInput.defaultProps.style = [TextInput.defaultProps.style, { fontFamily: 'Inter_500Medium' }];
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { 
              backgroundColor: isDark ? '#1A1D24' : '#FFFFFF',
              width: '100%',
              flex: 1,
            },
            animation: 'default',
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{
              contentStyle: {
                width: '100%',
                flex: 1,
              },
            }}
          />
          <Stack.Screen name="settings" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

