# MkweliMobile APK Build Checklist

## Pre-Build Checklist

- [ ] Java JDK 11+ is installed
  ```bash
  java -version
  ```

- [ ] Android SDK is installed
  ```bash
  echo $ANDROID_HOME
  ```

- [ ] Node.js and npm are installed
  ```bash
  node -v && npm -v
  ```

- [ ] Project dependencies are installed
  ```bash
  npm install
  ```

- [ ] No uncommitted changes that would affect the build
  ```bash
  git status
  ```

## Quick Build Steps

### Option 1: Using Build Scripts (Recommended)

**Debug APK (for testing):**
```bash
chmod +x build-apk-quick.sh
./build-apk-quick.sh
```

**Release APK (optimized):**
```bash
chmod +x build-apk-quick.sh
./build-apk-quick.sh release
```

### Option 2: Using Gradle Directly

**Debug APK:**
```bash
cd android
./gradlew assembleDebug
cd ..
```

**Release APK:**
```bash
cd android
./gradlew assembleRelease
cd ..
```

### Option 3: Using React Native CLI

**Build and run on connected device:**
```bash
npm run android
```

## Post-Build Steps

### Verify APK was Created

- [ ] APK exists at expected location:
  - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
  - Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

- [ ] APK file size is reasonable:
  - Debug: 50-100 MB
  - Release: 30-60 MB

### Test the APK

**Install on device/emulator:**
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**List installed packages:**
```bash
adb shell pm list packages | grep mkweli
```

**Launch the app:**
```bash
adb shell am start -n com.mkwelimobile/.MainActivity
```

**View logs:**
```bash
adb logcat | grep MkweliMobile
```

## Project Configuration Summary

| Property | Value |
|----------|-------|
| Package Name | com.mkwelimobile |
| App Name | MkweliMobile |
| Version Code | 1 |
| Version Name | 1.0.0 |
| Min SDK | 24 (Android 7.0) |
| Target SDK | 36 (Android 15) |
| Build Tools | 36.0.0 |
| React Native | 0.83.1 |
| Hermes Engine | Enabled |
| New Architecture | Enabled |

## Production Release Checklist

Before releasing to Google Play Store:

- [ ] Create a signed keystore file
- [ ] Update version code and version name
- [ ] Create signed APK or AAB (Android App Bundle)
- [ ] Test on multiple devices and Android versions
- [ ] Create app listing in Google Play Console
- [ ] Add screenshots and app description
- [ ] Set privacy policy and content rating
- [ ] Upload AAB/APK to Play Store
- [ ] Monitor crash reports and user reviews

## Common Issues & Solutions

### Issue: "ANDROID_HOME not set"
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

### Issue: "Gradle build fails"
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Issue: "Out of memory during build"
Edit `android/gradle.properties` and increase:
```ini
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Issue: "adb: command not found"
Add Android SDK platform-tools to PATH:
```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## File Structure

```
MkweliMobile/
├── App.tsx                    # Main React Native component
├── package.json               # Node dependencies
├── android/
│   ├── app/
│   │   ├── build.gradle       # App build configuration
│   │   └── src/
│   │       └── main/
│   │           ├── AndroidManifest.xml
│   │           └── java/com/mkwelimobile/
│   ├── build.gradle           # Project build configuration
│   ├── gradle.properties      # Gradle settings
│   └── gradlew                # Gradle wrapper
├── APK-BUILD-GUIDE.md         # Detailed build guide
├── BUILD-CHECKLIST.md         # This file
├── build-apk-quick.sh         # Quick build script
└── build-apk.sh               # Detailed build script
```

## References

- [React Native Android Docs](https://reactnative.dev/docs/android-build-setup)
- [Gradle Documentation](https://docs.gradle.org/)
- [Google Play Store Console](https://play.google.com/console)
- [Android Developer Docs](https://developer.android.com/docs)

## Support

For issues with:
- **React Native:** Check [React Native Issues](https://github.com/facebook/react-native/issues)
- **Gradle:** Check [Gradle Forums](https://discuss.gradle.org/)
- **Android Studio:** Check [Android Studio Help](https://developer.android.com/studio/intro)

---

**Last Updated:** January 2026
**Project:** MkweliMobile v1.0

