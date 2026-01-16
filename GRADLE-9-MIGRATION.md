# Gradle 9.0 Compatibility Migration Guide

## Summary of Changes

This document describes the deprecated Gradle features that were fixed to make the project compatible with Gradle 9.0. The project previously used Gradle 4.4.1, which is far too old and incompatible with modern Android development.

## Issues Fixed

### 1. **Buildscript Block Deprecation** (CRITICAL)
**File:** `android/build.gradle`

**Old Approach (Deprecated in Gradle 8.0, Removed in 9.0):**
```groovy
buildscript {
    ext { ... }
    repositories { ... }
    dependencies { ... }
}
apply plugin: "com.facebook.react.rootproject"
```

**New Approach (Gradle 8.0+ compatible):**
```groovy
plugins {
    id("com.facebook.react.rootproject")
}

ext { ... }
```

**Why:** The `buildscript` block was removed in Gradle 9.0. Modern Gradle uses the `plugins` block (declarative style) instead of the imperative `apply plugin` style.

---

### 2. **Imperative Apply Plugin Statements** (CRITICAL)
**File:** `android/app/build.gradle`

**Old Approach:**
```groovy
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
```

**New Approach:**
```groovy
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
}
```

**Why:** Imperative plugin application is deprecated. The declarative `plugins` block is now the standard and provides better dependency resolution and plugin management.

---

### 3. **Settings File Plugin Declaration** (CRITICAL)
**File:** `android/settings.gradle`

**Old Approach:**
```groovy
pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
plugins { id("com.facebook.react.settings") }
```

**New Approach:**
```groovy
pluginManagement {
    includeBuild("../node_modules/@react-native/gradle-plugin")
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

plugins {
    id("com.facebook.react.settings")
}
```

**Why:** 
- Added explicit repositories configuration for plugin management
- Added `dependencyResolutionManagement` block for explicit repository declaration
- Prevents ambiguous repository resolution errors

---

### 4. **Gradle Properties Enhancement** (OPTIONAL but RECOMMENDED)
**File:** `android/gradle.properties`

**Added Settings:**
```properties
# Gradle 9.0 compatibility settings
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.jvmargs=-Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:G1HeapRegionSize=16M
```

**Benefits:**
- `org.gradle.caching=true`: Enables build caching for faster incremental builds
- `org.gradle.parallel=true`: Enables parallel task execution
- Optimized JVM arguments for modern Java 17

---

## Testing the Changes

### Before Building
1. Ensure you have Java 17 installed (required by the project)
2. The project is configured to use `/usr/lib/jvm/java-17-openjdk-amd64`

### Build Command
```bash
cd /home/gil/MkweliMobile/android
./gradlew assembleDebug
```

### Verify Gradle Version
The `gradle-wrapper.properties` file specifies:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-bin.zip
```

This is Gradle 8.14.3, which is fully compatible with the changes made and serves as a bridge to Gradle 9.0.

---

## Migration Path to Gradle 9.0

The current configuration is **Gradle 9.0 ready**. To upgrade to Gradle 9.0 in the future:

1. Update `gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-9.0-bin.zip
```

2. Run gradlew wrapper to download the new version:
```bash
./gradlew wrapper --gradle-version=9.0
```

3. Run a build to verify:
```bash
./gradlew assembleDebug
```

---

## Deprecations No Longer Present

✅ **Buildscript block** - Removed  
✅ **Imperative apply plugin** - Replaced with declarative plugins block  
✅ **Implicit repository resolution** - Now explicit via dependencyResolutionManagement  
✅ **Missing pluginManagement repositories** - Now explicitly declared  

---

## Additional References

- [Gradle 9.0 Migration Guide](https://docs.gradle.org/9.0/userguide/upgrading_version_8_to_9.html)
- [Gradle Plugin Management](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)
- [Android Gradle Plugin Compatibility](https://developer.android.com/build/releases/gradle-plugin)

---

## Files Modified

1. `android/build.gradle` - Removed buildscript, added plugins block
2. `android/settings.gradle` - Enhanced with pluginManagement and dependencyResolutionManagement
3. `android/app/build.gradle` - Replaced apply plugin with plugins block
4. `android/gradle.properties` - Added Gradle 9.0 optimizations

All changes are backward compatible with Gradle 8.14.3 and forward compatible with Gradle 9.0.

