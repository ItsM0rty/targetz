# Targetz - Setup Instructions

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate native code** (required for development builds):
   ```bash
   npx expo prebuild
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Run on Android**:
   ```bash
   npm run android
   ```

## Important Notes

### Development Builds Required

This app uses **Expo Development Builds** (not Expo Go) because it requires native modules:
- Custom app detection module
- WorkManager for background tasks

### Android Permissions

The app requires the **PACKAGE_USAGE_STATS** permission for app detection:
1. When you enable app detection in settings, you'll be prompted
2. You must manually grant this in Android Settings → Apps → Special access → Usage access
3. Find "Targetz" and enable it

### First Run

1. Install dependencies: `npm install`
2. Run prebuild: `npx expo prebuild`
3. Start Metro: `npm start`
4. Build and run: `npm run android`

## Troubleshooting

### "Module not found" errors
- Run `npx expo prebuild` to generate native directories
- Clear cache: `npx expo start -c`

### Native module not working
- Ensure you're using a development build, not Expo Go
- Rebuild: `npx expo run:android`

### Permission issues
- Check AndroidManifest.xml has PACKAGE_USAGE_STATS permission
- Verify permission is granted in Android Settings

## Project Structure

- `app/` - Expo Router screens
- `src/` - Source code (components, stores, utils, theme)
- `app-detector/` - Native module for app detection
- `assets/` - Images, icons, etc.

## Next Steps

1. Create placeholder assets (icon.png, splash.png, etc.)
2. Test on physical Android device
3. Implement app selection UI
4. Add drag-and-drop reordering
5. Test battery impact

