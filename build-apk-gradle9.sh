#!/bin/bash
# Build script for Gradle 9.0 compatible MkweliMobile APK
# This script builds the Android APK using the updated Gradle configuration

set -e

PROJECT_DIR="/home/gil/MkweliMobile"
ANDROID_DIR="$PROJECT_DIR/android"

echo "=========================================="
echo "MkweliMobile APK Build - Gradle 9.0 Ready"
echo "=========================================="
echo ""

# Step 1: Check Java installation
echo "[1/5] Checking Java installation..."
java_home="/usr/lib/jvm/java-17-openjdk-amd64"
if [ -d "$java_home" ]; then
    export JAVA_HOME="$java_home"
    echo "✓ Java 17 found at: $JAVA_HOME"
    java -version
else
    echo "✗ Java 17 not found at expected location"
    exit 1
fi
echo ""

# Step 2: Navigate to Android directory
echo "[2/5] Navigating to Android directory..."
cd "$ANDROID_DIR"
echo "✓ Working directory: $(pwd)"
echo ""

# Step 3: Make gradlew executable
echo "[3/5] Ensuring gradlew is executable..."
chmod +x gradlew
echo "✓ gradlew permissions set"
echo ""

# Step 4: Display Gradle version
echo "[4/5] Gradle wrapper information..."
./gradlew --version
echo ""

# Step 5: Build the APK
echo "[5/5] Building APK..."
echo ""
echo "Running: ./gradlew assembleDebug"
./gradlew assembleDebug

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo ""
echo "APK Location:"
echo "  app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "For release build, run:"
echo "  ./gradlew assembleRelease"
echo ""

