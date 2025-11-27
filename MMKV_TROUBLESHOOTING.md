# MMKV "Not Running On-Device" Troubleshooting

## Issue
MMKV throws: `Failed to create a new MMKV instance: React Native is not running on-device`

This happens even when Chrome is closed and remote debugging appears disabled.

## Root Causes

### 1. Remote Debugging State Persistence
Even after closing Chrome, the app might still think remote debugging is active. The state can persist in:
- App's internal state
- Metro bundler cache
- Device's app data

### 2. JSI Initialization Timing
JSI (JavaScript Interface) might not be fully initialized when MMKV tries to create an instance, especially on first app launch or after a rebuild.

### 3. Dev Client Build Issues
The native module might not be properly compiled into the APK, even though autolinking shows it's configured.

## Solutions (Try in Order)

### Solution 1: Complete App Restart
1. **Force close the app completely** (not just background)
   - Android: Settings → Apps → Targetz → Force Stop
   - Or: Long press app icon → App Info → Force Stop
2. **Close Metro bundler** (Ctrl+C)
3. **Clear Metro cache**: `npx expo start --clear`
4. **Restart Metro**: `npx expo start --dev-client`
5. **Open the app fresh** (don't use "Reload", do a full restart)

### Solution 2: Rebuild Dev Client
If Solution 1 doesn't work, the native module might not be in the installed APK:

1. **Uninstall the app** from device:
   ```powershell
   adb uninstall com.targetz.app
   ```
2. **Clean build**:
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   ```
3. **Rebuild and reinstall**:
   ```powershell
   npm run android
   ```
4. **Start fresh**: Open the newly installed app

### Solution 3: Verify JSI Availability
The code now checks for JSI availability. Check Metro console for:
- `⚠️ JSI does not appear to be available` - indicates JSI detection failed
- This might mean the app needs a rebuild or there's a deeper issue

### Solution 4: Check Remote Debugging State
Even if Chrome is closed, verify remote debugging is truly off:

1. **Shake device** → Open dev menu
2. **Look for any debugging-related options** that might be enabled
3. **If you see "Stop Remote JS Debugging"** → Tap it
4. **Reload the app**

### Solution 5: Verify Native Module in APK
Check if MMKV is actually compiled into your APK:

```powershell
# List native libraries in APK
adb shell "run-as com.targetz.app ls -la /data/app/com.targetz.app-*/lib/arm64/ | grep mmkv"
```

If no MMKV library is found, the module isn't in the build - rebuild with Solution 2.

### Solution 6: Check React Native Version Compatibility
Verify your React Native version supports JSI properly:
- React Native 0.68+ has better JSI support
- You're on 0.81.5, which should be fine
- But verify `react-native-mmkv` version compatibility

### Solution 7: Nuclear Option - Full Clean Rebuild
If nothing else works:

1. **Delete node_modules**: `Remove-Item -Recurse -Force node_modules`
2. **Delete package-lock.json**: `Remove-Item package-lock.json`
3. **Clean Android build**: `cd android && .\gradlew clean && cd ..`
4. **Reinstall**: `npm install`
5. **Prebuild**: `npx expo prebuild --clean`
6. **Rebuild**: `npm run android`

## Current Code Status

The code now includes:
- ✅ JSI availability detection
- ✅ Better error messages with troubleshooting steps
- ✅ Mock storage fallback (app won't crash, but data won't persist)
- ✅ Multiple initialization attempts with warnings

## What to Check in Metro Console

When the error occurs, look for:
1. **JSI detection warnings** - tells you if JSI appears unavailable
2. **Initialization attempt count** - shows retry attempts
3. **Detailed error messages** - points to specific fixes

## If All Else Fails

If MMKV still doesn't work after trying all solutions:
1. The app will continue to work with mock storage (no persistence)
2. Consider temporarily using `@react-native-async-storage/async-storage` as a fallback
3. File an issue with the react-native-mmkv repository with:
   - Your React Native version (0.81.5)
   - Your Expo SDK version (54.0.25)
   - Your Android build configuration
   - The full error stack trace

## Verification Checklist

Before reporting the issue, verify:
- [ ] App is a dev client build (not Expo Go)
- [ ] `react-native-mmkv` is in `package.json`
- [ ] `react-native-nitro-modules` is in `package.json`
- [ ] `expo-dev-client` is in `package.json`
- [ ] Autolinking shows MMKV in `android/build/generated/autolinking/autolinking.json`
- [ ] App was rebuilt after adding MMKV
- [ ] Chrome is completely closed
- [ ] Remote debugging is disabled in dev menu
- [ ] App was force-closed and reopened (not just reloaded)

