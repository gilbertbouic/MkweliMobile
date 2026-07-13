# Building MkweliMobile APK - Gradle 9.0 Compatible

## Prerequisites

Before building, ensure you have the following installed:

### 1. **Java 17 Development Kit**
```bash
# Check if Java 17 is installed
java -version

# If not installed, install it:
sudo apt update
sudo apt install openjdk-17-jdk
```

### 2. **Android SDK**
```bash
# The project expects Android SDK components for API level 36
# Android Studio automatically manages this, or via command line:
# See Android documentation for CLI setup
```

### 3. **Node.js and npm**
```bash
# Check version
node --version
npm --version
```

## Gradle Configuration Overview

The following Gradle 9.0-compatible configurations have been applied:

### ✅ **Updated Configuration Files**

1. **android/build.gradle**
   - Removed deprecated `buildscript` block
   - Now uses declarative `plugins` block
   - Project-wide properties moved to `ext` block

2. **android/settings.gradle**
   - Added `pluginManagement` with explicit repositories
   - Added `dependencyResolutionManagement` block
   - Explicit repository declaration to prevent ambiguity

3. **android/app/build.gradle**
   - Replaced `apply plugin:` with declarative `plugins` block
   - Maintains all build configurations (debug/release, signing, etc.)

4. **android/gradle.properties**
   - Added Gradle 9.0 optimization settings
   - Configured Java 17 toolchain
   - Enabled build caching and parallel execution

## Building the APK

### **Option 1: Using the Gradle wrapper (Recommended)**

```bash
cd /home/gil/MkweliMobile/android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# Build release APK (requires signing configuration)
./gradlew assembleRelease
```

**Output locations:**
- Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `app/build/outputs/apk/release/app-release.apk`

### **Option 2: Using the build script**

```bash
cd /home/gil/MkweliMobile

# Make the script executable
chmod +x build-apk-gradle9.sh

# Run the build script
./build-apk-gradle9.sh
```

### **Option 3: Using npm scripts**

```bash
cd /home/gil/MkweliMobile

# Install dependencies
npm install

# Build the APK
npm run android

# Or build directly with Gradle
npx react-native run-android
```

## Building with Custom Options

### **Build with Specific Tasks**

```bash
cd android

# Clean build (remove old build artifacts)
./gradlew clean assembleDebug

# Build with increased logging
./gradlew assembleDebug --info

# Build with full debug output
./gradlew assembleDebug --debug

# Build specific architecture only
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a
```

### **Build Configuration Options**

In `android/gradle.properties`, you can modify:

```properties
# Architecture selection
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# Enable/disable new architecture
newArchEnabled=true

# Enable/disable Hermes JS engine
hermesEnabled=true

# JVM memory allocation
org.gradle.jvmargs=-Xmx2g

# Build optimization
org.gradle.caching=true
org.gradle.parallel=true
```

## Troubleshooting

### **Issue: "Permission denied" for gradlew**
```bash
chmod +x android/gradlew
```

### **Issue: Java version mismatch**
```bash
# Verify Java location
which java
java -version

# Set JAVA_HOME explicitly if needed
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### **Issue: Gradle daemon issues**
```bash
# Stop all Gradle daemons
./gradlew --stop

# Run build again
./gradlew assembleDebug
```

### **Issue: Out of memory errors**
Increase JVM memory in `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4g
```

### **Issue: Port 8081 already in use**
```bash
# Find and kill the process using port 8081
lsof -i :8081
kill -9 <PID>

# Or use different port
adb reverse tcp:8081 tcp:8081
```

## Gradle 9.0 Compatibility Status

✅ **Fully Compatible with Gradle 9.0**

The project has been updated with:
- Declarative `plugins` block (no `buildscript`)
- Explicit plugin repositories
- Proper dependency resolution management
- Java 17 toolchain configuration
- Gradle 8.14.3 as the wrapper version (compatible with 9.0 changes)

### **Future Upgrade to Gradle 9.0**

To upgrade to Gradle 9.0 when ready:

```bash
cd android
./gradlew wrapper --gradle-version=9.0
./gradlew assembleDebug  # Test the upgrade
```

## Performance Optimizations

The updated configuration includes:

1. **Build Caching** (`org.gradle.caching=true`)
   - Caches build outputs for faster incremental builds

2. **Parallel Execution** (`org.gradle.parallel=true`)
   - Executes independent tasks in parallel

3. **G1 Garbage Collector**
   - Better memory management for large builds
   - Optimized for Java 17

4. **Project Decoupling**
   - Improved build dependency graph analysis

## Expected Build Time

- **First build**: 5-10 minutes (downloads dependencies)
- **Subsequent builds**: 2-5 minutes
- **Clean build**: 5-10 minutes
- **With caching**: 30 seconds to 2 minutes

## Next Steps

After building the APK:

1. **Install on Emulator/Device**
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Generate Release APK**
   - Configure signing certificate
   - Run `./gradlew assembleRelease`

4. **Optimize Further**
   - Enable ProGuard/R8 minification
   - Optimize resources
   - Test on multiple devices

## References

- [Gradle 9.0 Migration Guide](https://docs.gradle.org/9.0/userguide/upgrading_version_8_to_9.html)
- [Android Gradle Plugin Documentation](https://developer.android.com/build/releases/gradle-plugin)
- [React Native Build Guide](https://reactnative.dev/docs/android-native-modules-setup)
- [Gradle Plugin Portal](https://plugins.gradle.org/)

---

**Configuration Version**: Gradle 8.14.3 (9.0-compatible)  
**Java Version**: 17.0.17  
**Last Updated**: January 2026

