# Debugging Guide for Targetz

## Important: MMKV Requires On-Device Debugging

**DO NOT use "JS Debugger" in the dev menu** - it opens Chrome and breaks MMKV.

When remote debugging (Chrome) is active, JavaScript runs in Chrome instead of on-device, which prevents MMKV from accessing JSI. This causes the error:
```
Failed to create a new MMKV instance: React Native is not running on-device
```

## On-Device Debugging Options

### 1. Metro Bundler Console (Recommended)
- **All `console.log()` statements appear in your Metro terminal**
- No setup required - works automatically
- Perfect for most debugging needs
- Example:
  ```javascript
  console.log('Debug value:', myVariable);
  console.warn('Warning message');
  console.error('Error details:', error);
  ```

### 2. React Native DevTools (Standalone)
- Install the standalone DevTools app or use the web version
- Provides React component inspector, network monitor, and more
- **Does NOT require remote debugging** - works with on-device JS
- Setup:
  1. Install: `npm install --save-dev react-devtools`
  2. Run: `npx react-devtools`
  3. Connect to your running app (should auto-connect)

### 3. Flipper (Advanced)
- Full-featured debugging platform
- Requires additional setup but provides powerful debugging tools
- Works with on-device JavaScript execution
- See: https://fbflipper.com/

## How to Ensure Remote Debugging is Disabled

1. **Close Chrome completely** if it's open
2. **Shake device** → Open dev menu
3. **DO NOT tap "JS Debugger"** or "Debug JS Remotely"
4. If Chrome opens, close it immediately
5. Reload the app (shake → "Reload" or press `R` twice in Metro)

## Verifying On-Device Execution

When JavaScript is running on-device:
- ✅ Metro console shows logs immediately
- ✅ MMKV works without errors
- ✅ No Chrome window opens
- ✅ App performance is better (no bridge overhead)

When remote debugging is active:
- ❌ Chrome window opens
- ❌ MMKV throws "not running on-device" error
- ❌ Console logs appear in Chrome DevTools, not Metro
- ❌ App may feel slower

## Troubleshooting

**If MMKV still shows errors:**
1. Force close the app completely
2. Close Chrome if it's open
3. Restart Metro: `npx expo start --clear`
4. Rebuild if needed: `npm run android`
5. Open the app again (don't tap JS Debugger)

**If you accidentally enabled remote debugging:**
1. Close Chrome immediately
2. Shake device → Look for "Stop Remote JS Debugging" (if available)
3. Or: Force close app and reopen
4. Reload the app

## Best Practices

- Use `console.log()` for most debugging - it's fast and works perfectly
- Use React DevTools for component inspection
- Only use Chrome debugger if you absolutely need it (and accept that MMKV won't work)
- Keep remote debugging disabled during normal development

