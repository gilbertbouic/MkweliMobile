# MkweliMobile - Complete Build & Run Guide

## ✅ All Issues Fixed

The following issues have been resolved:

1. **android/build.gradle** - Added proper `buildscript` and `allprojects` blocks with React Native compatible versions (SDK 34 instead of 36)
2. **android/settings.gradle** - Removed `FAIL_ON_PROJECT_REPOS` conflict
3. **android/gradle.properties** - Fixed duplicate JVM arguments
4. **App.tsx** - Fixed image path to use proper Android drawable reference

## 🚀 Build & Run Commands

### Option 1: Automated Script (Recommended)
```bash
cd ~/MkweliMobile
chmod +x build-and-run.sh
./build-and-run.sh
```

This script will:
- Check environment (Node.js, Java, ADB)
- Start emulator if not running
- Install dependencies
- Clean and build APK
- Install APK on emulator
- Start Metro bundler
- Launch the app

### Option 2: Manual Commands

**Step 1: Start Emulator (if not running)**
```bash
# Check running devices
adb devices

# If none, start emulator
emulator -avd test &
adb wait-for-device
```

**Step 2: Install Dependencies**
```bash
cd ~/MkweliMobile
npm install
```

**Step 3: Build APK**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

**Step 4: Install on Emulator**
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**Step 5: Start Metro Bundler**
```bash
npm start &
# Wait 10 seconds for Metro to start
```

**Step 6: Launch App**
```bash
adb shell am start -n com.mkwelimobile/.MainActivity
```

## 📱 Testing the App

Once launched, test the sanctions screening:

1. **Logo Display**: The Mweli.webp logo should appear at the top
2. **Placeholder Text**: Input field shows "MKweliAML"
3. **Sanctioned Names** (should show "Sanctioned: Match found"):
   - Vladimir Putin
   - Kim Jong Un
   - Bashar al-Assad
4. **Non-Sanctioned Names** (should show "Not sanctioned"):
   - John Smith
   - Jane Doe
   - Test User

## 🔧 Troubleshooting

### Build Fails with "gradlew not found"
```bash
cd ~/MkweliMobile/android
chmod +x gradlew
```

### Metro Port Already in Use
```bash
pkill -f "react-native start"
npm start
```

### App Won't Install
```bash
# Uninstall old version
adb uninstall com.mkwelimobile

# Reinstall
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### App Crashes on Launch
```bash
# View logs
adb logcat | grep -i mkweli
```

### Clean Build (if something goes wrong)
```bash
cd ~/MkweliMobile
rm -rf node_modules android/.gradle android/app/build
npm install
cd android && ./gradlew clean && ./gradlew assembleDebug && cd ..
```

## 📋 Key Configuration Changes

### android/build.gradle
- Added `buildscript` with proper dependencies
- Downgraded SDK versions: 36 → 34 (React Native compatible)
- Added `allprojects` repositories block

### android/settings.gradle
- Removed `FAIL_ON_PROJECT_REPOS` to allow project-level repositories

### android/gradle.properties
- Fixed duplicate JVM arguments
- Optimized memory settings: `-Xmx2g -XX:+UseG1GC`

### App.tsx
- Fixed image source to use proper drawable reference: `{uri: 'mweli', isStatic: true}`

## 📦 APK Location

After successful build:
```
~/MkweliMobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Typical size: 30-50MB

## ✨ App Features

- ✅ AML Sanctions Screening
- ✅ Real-time name matching
- ✅ JSON database from converted XML files (SDN, UK sanctions)
- ✅ Dark mode support
- ✅ Loading indicators
- ✅ Clear result display
- ✅ Professional UI with logo

## 🎯 Next Steps

1. Run `./build-and-run.sh` to build and launch
2. Test sanctions screening functionality
3. Verify logo displays correctly
4. Test with various names from the sanctions database

---

**Status**: ✅ Ready to Build and Run
**Last Updated**: January 16, 2026
