## MMKV native module missing / Expo Go incompatibility

### Symptoms
- Metro warns every route file (`./_layout.jsx`, `./index.jsx`, `./settings.jsx`) is missing a default export, followed by `Error: Failed to create a new MMKV instance: The native MMKV Module could not be found`.
- When JS runs remotely (Chrome debugger, JS Dev Mode), MMKV throws `React Native is not running on-device` and Expo Router falls back to the unmatched-route screen.
- In bridgeless sessions we also see `PlatformConstants could not be found` because the running binary (Expo Go) does not include the native modules bundled in our dev client build.

### Diagnosis
- `react-native-mmkv` relies on JSI and ships as native `.so`/`.aar` code. Expo Go doesn’t include this module, so any bundle executed inside Expo Go (or remote JS debugger) fails during `settingsStore` initialization (`src/stores/settingsStore.js`).
- Once MMKV throws, React components never finish evaluating, which explains the downstream router warnings.

### Attempted fixes
1. **Disable remote debugging / JS Dev Mode** – ensured Hermes runs on-device so MMKV can access JSI. Result: removes the “JS not on-device” error but Expo Go still lacks the native module.
2. **`npx expo prebuild --clean`, `.\gradlew clean`, rebuild Gradle config** – regenerated native projects and synced Kotlin/AGP versions. Result: Android build can now include MMKV, but the app was still being run inside Expo Go, so the module remained missing.
3. **Reinstall dependencies (`npm install`, `npx expo install expo-splash-screen`)** – verified dependencies are present; issue persisted because the runtime binary still didn’t contain MMKV.

### Alternative fixes / next actions
1. **Run the dev client instead of Expo Go** (recommended, already partially attempted):
   - Build/install via `npm run android` (or `npx expo run:android`). This compiles the `android/` project that already links `react-native-mmkv`.
   - Launch with `npx expo start --dev-client` and open the installed app (not Expo Go). This matches the guidance from the MMKV maintainers and Expo docs that custom native modules require a dev build or EAS build.
2. **Use EAS Dev Client** (online recommendation: [mrousavy/react-native-mmkv#549](https://github.com/mrousavy/react-native-mmkv/issues/549)):
   - `expo install expo-dev-client`
   - `eas build --profile development --platform android`
   - Run with `expo start --dev-client`
   This yields signed builds for physical devices without relying on Expo Go.
3. **Install and use Expo Dev Client / EAS dev builds** (per Expo + MMKV docs):
   - `npx expo install expo-dev-client react-native-mmkv react-native-nitro-modules`
   - `npx expo prebuild` (already done) to sync native folders.
   - `eas build --profile development --platform android` (or `ios`) to produce a dev client APK/IPA with MMKV baked in.
   - Launch via `npx expo start --dev-client`.
   This guarantees the binary always contains MMKV, works on physical devices, and avoids Expo Go entirely.
4. **Ensure remote debugging stays off**:
   - After switching to the dev client, keep “JS Dev Mode” disabled so MMKV can access JSI.

### Completed Steps
1. ✅ **Installed expo-dev-client and react-native-nitro-modules** (Step 1):
   - Ran `npx expo install expo-dev-client react-native-nitro-modules`
   - Both packages are now in `package.json` and linked via Expo autolinking
   - Verified `android/app/build.gradle` has `autolinkLibrariesWithApp()` enabled
   - Ran `npx expo prebuild --clean` to regenerate native code with new modules

2. ✅ **Verified native module configuration** (Step 2):
   - Autolinking is properly configured in `android/settings.gradle`
   - `expo-dev-client` doesn't require explicit plugin configuration (works automatically)
   - MMKV initialization in `src/stores/settingsStore.js` is correct: `new MMKV({ id: 'settings' })`

### Next Steps (Step 3 - When Ready)
- **Build the dev client**: Run `npm run android` (or `npx expo run:android`) to compile and install the native app with MMKV included
- **Start Metro with dev client**: After build completes, run `npx expo start --dev-client` 
- **Important**: Open the installed dev client app (NOT Expo Go) and ensure JS Dev Mode is disabled in dev menu settings
- This will resolve all MMKV errors as the native module will be present in the binary

### Current Status (Step 3 - In Progress)
- ✅ Dev client built and installed successfully on POCOPHONE_F1
- ✅ Metro bundler started automatically after build
- ✅ Lazy MMKV initialization implemented to prevent early JSI access
- ✅ JSI availability detection added
- ✅ Enhanced error messages with troubleshooting steps
- ⚠️ **IMPORTANT**: Do NOT tap "JS Debugger" in dev menu - it opens Chrome and breaks MMKV
- ⚠️ **ONGOING ISSUE**: MMKV still fails even when Chrome is closed - see `MMKV_TROUBLESHOOTING.md`

### Solution Summary
**The fix:** Use on-device debugging instead of Chrome remote debugger
- **DO NOT** tap "JS Debugger" in the dev menu
- Use `console.log()` - logs appear in Metro terminal
- Use React DevTools for component inspection (doesn't require remote debugging)
- See `DEBUGGING.md` for complete debugging guide

**Current Issue:**
Even with Chrome closed, MMKV reports "not running on-device". This suggests:
1. Remote debugging state might be persisted
2. JSI might not be initialized when MMKV tries to create instance
3. The dev client might need a full rebuild

**See `MMKV_TROUBLESHOOTING.md` for:**
- Complete troubleshooting steps
- How to verify JSI is available
- How to force a complete app restart
- How to rebuild the dev client if needed
- Verification checklist

**Why this works (when it works):**
- When remote debugging is OFF, JavaScript runs on-device (Hermes) with JSI access
- MMKV can then access JSI and works correctly
- Lazy initialization ensures MMKV is created after JSI is ready

