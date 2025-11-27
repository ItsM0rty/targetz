# Targetz - Productivity Todo App

A modern, Android-first todo app with smart app-triggered reminders built with React Native and Expo.

## Features

- ✅ **Smart Todo Management**: CRUD operations with priority ranking and drag-and-drop reordering
- ⏰ **Time-Based Reminders**: Scheduled notifications at custom intervals
- 📱 **App-Triggered Reminders** (Android): Get reminded when opening specific apps
- 🎨 **Theme System**: Beautiful dark/light mode with smooth transitions
- 💰 **Free/Paid Modes**: Free tier with 2 app limit, paid with unlimited

## Tech Stack

- **Framework**: React Native 0.74+ with Expo SDK 51+
- **Build System**: Expo Development Builds
- **Storage**: react-native-mmkv (20-30x faster than AsyncStorage)
- **State Management**: Zustand
- **Notifications**: expo-notifications
- **Animations**: Moti (built on Reanimated 2)
- **Drag & Drop**: react-native-draglist
- **App Detection**: Custom native module using UsageStatsManager

## Prerequisites

- Node.js 18.18+ LTS
- npm or Yarn
- Android Studio (for Android emulator/SDK)
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli` (optional, for cloud builds)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate native directories** (required for development builds):
   ```bash
   npx expo prebuild
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on Android**:
   ```bash
   npm run android
   ```

## Development

### Project Structure

```
targetz/
├── app/                    # Expo Router screens
│   ├── _layout.jsx        # Root layout
│   ├── index.jsx         # Home screen
│   └── settings.jsx      # Settings screen
├── src/
│   ├── components/        # Reusable UI components
│   ├── stores/           # Zustand state stores
│   ├── theme/            # Theme system
│   └── utils/            # Utility functions
├── app-detector/         # Native module for app detection
│   ├── app.plugin.js     # Expo config plugin
│   └── android/          # Android native code
└── assets/               # Images, fonts, etc.
```

### Key Components

- **TodoStore**: Manages todos with MMKV persistence
- **SettingsStore**: Handles app settings and preferences
- **AppDetectorModule**: Native Kotlin module for app detection
- **NotificationUtils**: Handles notification scheduling

## Building for Production

### Android (Local)
```bash
npx expo run:android --variant release
```

### Android (Cloud - EAS Build)
```bash
eas build --platform android
```

## Permissions

### Android

- **PACKAGE_USAGE_STATS**: Required for app detection feature
  - User must grant this manually in Android Settings
  - The app will guide users to the settings page

- **Notifications**: Required for reminders
  - Requested automatically on first use

## Performance Targets

- Cold start: <2s
- List scrolling: 60fps
- Storage read/write: <1ms (MMKV)
- Battery drain: <2% per day with app detection

## License

Private - All rights reserved

