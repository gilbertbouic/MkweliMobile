# Building APK Guide for MkweliMobile

This guide explains how to build APK files from the MkweliMobile React Native project.

## Prerequisites

Before building, ensure you have:
- Java JDK 11 or higher installed
- Android SDK installed and `ANDROID_HOME` environment variable set
- Node.js and npm installed (already set up)

### Verify Prerequisites

```bash
java -version
echo $ANDROID_HOME
node -v
npm -v
```

## Build Process

### Step 1: Install Dependencies (if not already done)

```bash
npm install
```

### Step 2: Build Debug APK

The debug APK is intended for testing and development:

```bash
cd android
./gradlew assembleDebug
cd ..
```

The generated APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Size:** Usually 50-100 MB
**Time:** 5-15 minutes depending on your machine

### Step 3: Build Release APK

The release APK is optimized for distribution but still uses the debug keystore. This is suitable for testing but not for Play Store distribution:

```bash
cd android
./gradlew assembleRelease
cd ..
```

The generated APK will be at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Size:** Usually 30-60 MB (smaller than debug due to minification)
**Time:** 10-20 minutes depending on your machine

## Installing on Device/Emulator

### Using ADB (Android Debug Bridge)

```bash
# Install debug APK on connected device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Or release APK
adb install -r android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Using Android Studio

1. Open Android Studio
2. Go to File → Open and select the `android` folder
3. Wait for gradle sync to complete
4. Click Run → Run 'app' or press Shift+F10

## Advanced: Creating a Signed Release APK for Play Store

If you plan to upload to Google Play Store, you need to create a signed APK:

### 1. Generate a Keystore File

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

This will ask for:
- Keystore password
- Key password
- Your name
- Organization
- City
- State
- Country code
- Confirmation

### 2. Configure Gradle for Signing

Edit `android/app/build.gradle` and update the `signingConfigs` section:

```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        storeFile file('my-release-key.jks')
        storePassword 'your-keystore-password'
        keyAlias 'my-key-alias'
        keyPassword 'your-key-password'
    }
}
```

### 3. Update Release Build Type

```groovy
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### 4. Build Signed Release APK

```bash
cd android
./gradlew assembleRelease
cd ..
```

The signed APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### Issue: "gradle not found"
**Solution:** Run from the `android` directory where `gradlew` is located

### Issue: "ANDROID_HOME not set"
**Solution:** Set the environment variable:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

### Issue: "Java version too old"
**Solution:** Install Java 11+:
```bash
# Ubuntu/Debian
sudo apt-get install openjdk-11-jdk

# macOS
brew install openjdk@11
```

### Issue: Out of Memory during build
**Solution:** Increase Gradle heap size in `android/gradle.properties`:
```ini
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Issue: Build fails on first run
**Solution:** Clean and rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

## Project Configuration

### App Information
- **Package Name:** com.mkwelimobile
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 36 (Android 15)
- **Version Code:** 1
- **Version Name:** 1.0

### Build Configuration
- **Hermes Engine:** Enabled (for better performance)
- **New Architecture:** Enabled
- **Edge-to-Edge Display:** Disabled
- **Build Tools:** 36.0.0
- **NDK Version:** 27.1.12297006

## Next Steps

1. After building the APK, test it on devices with different Android versions
2. Use Firebase or Crashlytics to monitor app performance
3. When ready, create a signed APK for Play Store distribution
4. Submit to Google Play Store using Play Console

## Resources

- [React Native Android Build Documentation](https://reactnative.dev/docs/android-build-setup)
- [Android Gradle Plugin Documentation](https://developer.android.com/build/gradle)
- [Google Play Console](https://play.google.com/console)

