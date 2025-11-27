# Android Development Setup Guide

## Step 1: Install Android Studio

1. **Download Android Studio**: https://developer.android.com/studio
2. **Install it** with default settings
3. **Open Android Studio** and complete the setup wizard:
   - It will download the Android SDK automatically
   - Accept all license agreements

## Step 2: Set Environment Variables

After installation, set these environment variables:

### Windows (PowerShell - Current Session):
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

### Windows (Permanent - System Settings):
1. Press `Win + X` → System → Advanced system settings
2. Click "Environment Variables"
3. Under "User variables", click "New":
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\m0rty\AppData\Local\Android\Sdk`
4. Edit "Path" variable, add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`

### Verify Installation:
```powershell
# Check if adb is available
adb version

# Check ANDROID_HOME
echo $env:ANDROID_HOME
```

## Step 3: Install Required SDK Components

Open Android Studio → SDK Manager and install:
- Android SDK Platform 34 (or latest)
- Android SDK Build-Tools
- Android Emulator (optional, for testing)

## Step 4: Test Your Setup

```bash
# Restart your terminal/PowerShell after setting environment variables
npm run android
```

## Alternative: Use Physical Device

If you have an Android phone:
1. Enable Developer Options on your phone
2. Enable USB Debugging
3. Connect via USB
4. Run `npm run android`

