#!/bin/bash
# Copy-Paste Commands for MkweliMobile APK Building
# Run commands from /home/gil/MkweliMobile directory

# ============================================
# PREREQUISITE CHECKS
# ============================================

# Check Java installation
java -version

# Check Android SDK
echo $ANDROID_HOME

# Check Node.js
node -v && npm -v

# Install dependencies (if needed)
npm install

# ============================================
# BUILD COMMANDS - CHOOSE ONE
# ============================================

# OPTION 1: Quick Build Script (Recommended for Beginners)
chmod +x build-apk-quick.sh
./build-apk-quick.sh              # Builds debug APK
./build-apk-quick.sh release      # Builds release APK

# OPTION 2: Gradle Direct (Recommended for Speed)
cd android && ./gradlew assembleDebug && cd ..      # Debug APK
cd android && ./gradlew assembleRelease && cd ..    # Release APK

# OPTION 3: React Native CLI
npm run android                   # Build and run on connected device

# OPTION 4: Clean Build (if something fails)
cd android && ./gradlew clean && ./gradlew assembleDebug && cd ..

# ============================================
# VERIFY APK WAS CREATED
# ============================================

# List generated APK files
ls -lh android/app/build/outputs/apk/*/app-*.apk

# Check file sizes
du -h android/app/build/outputs/apk/debug/app-debug.apk
du -h android/app/build/outputs/apk/release/app-release-unsigned.apk

# ============================================
# INSTALLATION COMMANDS
# ============================================

# List connected devices
adb devices

# Install debug APK on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Install release APK on device
adb install -r android/app/build/outputs/apk/release/app-release-unsigned.apk

# Check if app is installed
adb shell pm list packages | grep mkweli

# ============================================
# LAUNCH AND TEST
# ============================================

# Launch the app
adb shell am start -n com.mkwelimobile/.MainActivity

# View real-time logs
adb logcat | grep "mkweli\|ReactNative"

# View all logs
adb logcat

# Clear logs
adb logcat -c

# ============================================
# TROUBLESHOOTING COMMANDS
# ============================================

# Set ANDROID_HOME if not set
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Install Java (Ubuntu/Debian)
sudo apt-get install openjdk-11-jdk

# Fix gradle permission issues
chmod +x android/gradlew

# Rebuild with verbose output for debugging
cd android && ./gradlew assembleDebug --info && cd ..

# Check Gradle daemon status
cd android && ./gradlew --status && cd ..

# Stop Gradle daemon
cd android && ./gradlew --stop && cd ..

# ============================================
# APK INFORMATION
# ============================================

# Get APK package name
aapt dump badging android/app/build/outputs/apk/debug/app-debug.apk | grep package

# Get APK size in detail
zipinfo -h android/app/build/outputs/apk/debug/app-debug.apk | tail -1

# ============================================
# DEVICE MANAGEMENT
# ============================================

# Get device info
adb shell getprop ro.build.version.release        # Android version
adb shell getprop ro.product.model                # Device model
adb shell getprop ro.serialno                     # Serial number

# Clear app data
adb shell pm clear com.mkwelimobile

# Uninstall app
adb uninstall com.mkwelimobile

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png

# ============================================
# BUILD CONFIGURATION
# ============================================

# View Gradle version
cd android && ./gradlew --version && cd ..

# View Android SDK versions
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list

# Update Gradle
cd android && ./gradlew wrapper --gradle-version latest && cd ..

# ============================================
# ENVIRONMENT SETUP
# ============================================

# Add Android tools to PATH permanently (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

# Verify Android SDK installation
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list | grep "API"

# ============================================
# PERFORMANCE TUNING
# ============================================

# Increase Gradle heap size (edit android/gradle.properties)
# org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m

# Enable Gradle parallel build (edit android/gradle.properties)
# org.gradle.parallel=true

# Enable Gradle daemon
# org.gradle.daemon=true

# ============================================
# CI/CD INTEGRATION
# ============================================

# Build APK in CI environment (non-interactive)
cd android && ./gradlew assembleDebug -q && cd ..

# Build and get exit code
cd android && ./gradlew assembleDebug && echo "BUILD_SUCCESS=true" || echo "BUILD_SUCCESS=false"

# ============================================
# FILE LOCATIONS
# ============================================

# Project root
/home/gil/MkweliMobile

# Generated APK files
# Debug APK
/home/gil/MkweliMobile/android/app/build/outputs/apk/debug/app-debug.apk

# Release APK
/home/gil/MkweliMobile/android/app/build/outputs/apk/release/app-release-unsigned.apk

# Build artifacts
/home/gil/MkweliMobile/android/app/build/

# Gradle cache
/home/gil/MkweliMobile/android/.gradle/

# ============================================
# QUICK REFERENCE COMMANDS
# ============================================

# One-liner: Full debug build cycle
cd /home/gil/MkweliMobile && cd android && ./gradlew assembleDebug && cd .. && adb install -r android/app/build/outputs/apk/debug/app-debug.apk && adb shell am start -n com.mkwelimobile/.MainActivity && adb logcat | grep "mkweli"

# One-liner: Fast rebuild and test
cd /home/gil/MkweliMobile/android && ./gradlew assembleDebug && cd .. && adb install -r android/app/build/outputs/apk/debug/app-debug.apk && adb shell am start -n com.mkwelimobile/.MainActivity

# One-liner: View real-time logs
adb logcat | grep "mkweli\|ReactNative\|error\|Error\|ERROR"

# ============================================
# NOTES
# ============================================

# Default keystore for debug builds:
# Location: android/app/debug.keystore
# Store password: android
# Key alias: androiddebugkey
# Key password: android

# App configuration:
# Package name: com.mkwelimobile
# Min SDK: 24 (Android 7.0)
# Target SDK: 36 (Android 15)
# Version: 1.0

# Build times (approximate):
# First debug build: 10-20 minutes
# Subsequent debug: 5-10 minutes
# First release build: 15-25 minutes
# Subsequent release: 10-15 minutes

