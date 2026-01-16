# Quick Reference: Building APK for MkweliMobile

## TL;DR - Build APK in 3 Steps

```bash
# Step 1: Navigate to project
cd /home/gil/MkweliMobile

# Step 2: Build APK (choose one)
cd android && ./gradlew assembleDebug && cd ..      # For testing
# OR
cd android && ./gradlew assembleRelease && cd ..    # For distribution

# Step 3: Find your APK
ls -lh android/app/build/outputs/apk/*/app-*.apk
```

---

## Build Commands Explained

### Debug APK (Recommended for Testing)
```bash
cd android
./gradlew assembleDebug
cd ..
```
- **Output:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size:** ~50-100 MB
- **Time:** 5-15 minutes
- **Best for:** Testing, development
- **Install:** `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Optimized)
```bash
cd android
./gradlew assembleRelease
cd ..
```
- **Output:** `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- **Size:** ~30-60 MB (smaller, minified)
- **Time:** 10-20 minutes
- **Best for:** Performance testing, distribution
- **Install:** `adb install -r android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Clean Build (if something fails)
```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

---

## Installation on Device/Emulator

### Prerequisites
```bash
# Check if adb is available
which adb

# OR add to PATH if not found
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Install Commands
```bash
# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Check if installed
adb shell pm list packages | grep mkweli

# Launch app
adb shell am start -n com.mkwelimobile/.MainActivity

# View logs
adb logcat | grep "com.mkwelimobile\|ReactNative"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `java: command not found` | Install Java: `sudo apt-get install openjdk-11-jdk` |
| `ANDROID_HOME not set` | `export ANDROID_HOME=$HOME/Android/Sdk` |
| `Permission denied` on gradlew | `chmod +x android/gradlew` |
| Build out of memory | Edit `android/gradle.properties`: `org.gradle.jvmargs=-Xmx4096m` |
| APK not found after build | Check build logs: `cd android && ./gradlew assembleDebug --info` |
| No connected devices | Run: `adb devices` and enable USB debugging on phone |

---

## Project Information

- **App Package:** com.mkwelimobile
- **Min Android:** 7.0 (API 24)
- **Target Android:** 15 (API 36)
- **React Native:** 0.83.1
- **Engine:** Hermes (optimized)

---

## Build Time Expectations

### First Build
- **Total Time:** 15-25 minutes
- Dependencies must download
- Gradle daemon starts up

### Subsequent Builds
- **Debug:** 5-10 minutes
- **Release:** 10-15 minutes

### Factors that Affect Speed
- Machine specs (CPU, RAM, SSD)
- Network connection (for downloading deps)
- Available RAM (build requires 2-4 GB)

---

## File Locations

```
Project Root: /home/gil/MkweliMobile/

Key Files:
- App.tsx                          # Main app code
- package.json                     # Dependencies
- android/app/build.gradle         # Build config
- android/gradle.properties        # Gradle settings

Generated Files:
- android/app/build/outputs/apk/debug/app-debug.apk
- android/app/build/outputs/apk/release/app-release-unsigned.apk

Build Artifacts:
- android/app/build/                # Build output
- android/.gradle/                  # Gradle cache
```

---

## Next Steps After Building

### Testing the APK
1. Install on device: `adb install -r <apk-path>`
2. Launch from Play Store or: `adb shell am start -n com.mkwelimobile/.MainActivity`
3. Test core functionality
4. Check device logs: `adb logcat`

### For Play Store Distribution
1. Create signed APK (see APK-BUILD-GUIDE.md)
2. Upload to Google Play Console
3. Add app description, screenshots, privacy policy
4. Set content rating
5. Submit for review

### Continuous Integration
1. Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
2. Automate APK building
3. Run tests before building
4. Auto-upload to Play Store/Firebase App Distribution

---

## Helpful Links

- 📱 [React Native Docs](https://reactnative.dev/docs/getting-started)
- 🤖 [Android Docs](https://developer.android.com/docs)
- 📦 [Gradle Docs](https://docs.gradle.org/)
- 🏪 [Play Store Console](https://play.google.com/console)
- 🐛 [React Native Issues](https://github.com/facebook/react-native/issues)

---

## Development Workflow

```bash
# 1. Make code changes to App.tsx or other files

# 2. Build new APK
cd android && ./gradlew assembleDebug && cd ..

# 3. Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 4. Test on device
adb shell am start -n com.mkwelimobile/.MainActivity

# 5. View logs for debugging
adb logcat | grep "mkweli\|ReactNative"

# 6. Repeat steps 1-5 as needed
```

---

**Quick Build Scripts Available:**
- `./build-apk-quick.sh` - Fast build with auto-detection
- `./build-apk.sh` - Detailed build with full output
- See `APK-BUILD-GUIDE.md` for detailed instructions
- See `BUILD-CHECKLIST.md` for production release steps

---

**Questions?** Check the detailed guides:
1. `APK-BUILD-GUIDE.md` - Comprehensive guide
2. `BUILD-CHECKLIST.md` - Complete checklist
3. This file - Quick reference

