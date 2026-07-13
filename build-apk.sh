#!/bin/bash

# Build APK Script for MkweliMobile React Native Project
# This script builds both debug and release APKs

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "MkweliMobile APK Builder"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 11 or higher."
    exit 1
fi
echo "✓ Java found: $(java -version 2>&1 | head -n 1)"

if ! command -v gradle &> /dev/null && [ ! -f "android/gradlew" ]; then
    echo "❌ Gradle not found. Please ensure gradle/gradlew is available."
    exit 1
fi
echo "✓ Gradle found"

echo ""
echo -e "${BLUE}Building APK...${NC}"
echo ""

# Build debug APK
echo -e "${YELLOW}Building debug APK...${NC}"
cd android
./gradlew assembleDebug
cd ..

DEBUG_APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$DEBUG_APK" ]; then
    echo -e "${GREEN}✓ Debug APK built successfully!${NC}"
    echo -e "  Location: $DEBUG_APK"
    echo -e "  Size: $(du -h "$DEBUG_APK" | cut -f1)"
else
    echo "❌ Debug APK not found. Build may have failed."
    exit 1
fi

echo ""
echo -e "${YELLOW}Building release APK...${NC}"
cd android
./gradlew assembleRelease
cd ..

RELEASE_APK="android/app/build/outputs/apk/release/app-release-unsigned.apk"
if [ -f "$RELEASE_APK" ]; then
    echo -e "${GREEN}✓ Release APK built successfully!${NC}"
    echo -e "  Location: $RELEASE_APK"
    echo -e "  Size: $(du -h "$RELEASE_APK" | cut -f1)"
else
    echo "❌ Release APK not found. Build may have failed."
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Build Complete!${NC}"
echo "=========================================="
echo ""
echo "APK Files:"
echo "  Debug:   $DEBUG_APK"
echo "  Release: $RELEASE_APK"
echo ""
echo "To install on device:"
echo "  Debug: adb install -r $DEBUG_APK"
echo ""
echo "Note: The release APK needs to be signed for Play Store distribution."
echo "=========================================="

