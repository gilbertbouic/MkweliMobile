#!/bin/bash

# Quick APK Build Script for MkweliMobile
# Run this script from the project root directory

set -e

echo "=========================================="
echo "MkweliMobile APK Builder"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check Java installation
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java is not installed"
    echo "Please install Java 11 or higher"
    exit 1
fi

echo "✓ Project ready to build"
echo "✓ Java found"
echo ""

# Determine build type
if [ "$1" == "release" ]; then
    BUILD_TYPE="release"
    echo "Building Release APK..."
else
    BUILD_TYPE="debug"
    echo "Building Debug APK..."
fi

echo ""
echo "Starting Gradle build..."
echo "(This may take 5-20 minutes on first build)"
echo ""

cd android
./gradlew assemble${BUILD_TYPE^}
cd ..

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo ""

if [ "$BUILD_TYPE" == "debug" ]; then
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
else
    APK_PATH="android/app/build/outputs/apk/release/app-release-unsigned.apk"
fi

if [ -f "$APK_PATH" ]; then
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "✓ APK generated successfully!"
    echo ""
    echo "Location: $APK_PATH"
    echo "Size: $SIZE"
    echo ""
    if command -v adb &> /dev/null; then
        echo "To install on connected device:"
        echo "  adb install -r $APK_PATH"
    fi
else
    echo "❌ APK not found at expected location"
    exit 1
fi

echo ""
echo "=========================================="

