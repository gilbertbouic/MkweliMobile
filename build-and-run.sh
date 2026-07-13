#!/bin/bash

# MkweliMobile Complete Build and Run Script
# This script builds the APK and launches it on a virtual device

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "MkweliMobile Build & Run Script"
echo "=========================================${NC}"
echo ""

# Step 1: Check environment
echo -e "${YELLOW}Step 1: Checking Environment${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not found${NC}"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo -e "${RED}ERROR: Java not found${NC}"
    exit 1
fi

if ! command -v adb &> /dev/null; then
    echo -e "${RED}ERROR: ADB not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
echo -e "${GREEN}✓${NC} Java: $(java -version 2>&1 | head -n 1)"
echo -e "${GREEN}✓${NC} ADB: $(adb --version | head -n 1)"
echo ""

# Step 2: Check for running emulator
echo -e "${YELLOW}Step 2: Checking for Android Emulator${NC}"
DEVICES=$(adb devices | grep -w "device" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo -e "${YELLOW}No emulator detected. Attempting to start one...${NC}"

    # List available AVDs
    AVDS=$(emulator -list-avds 2>/dev/null | head -n 1)

    if [ -z "$AVDS" ]; then
        echo -e "${RED}ERROR: No Android Virtual Devices found${NC}"
        echo "Please create an AVD using Android Studio or run:"
        echo "  avdmanager create avd -n test -k \"system-images;android-34;google_apis;x86_64\""
        exit 1
    fi

    echo -e "${BLUE}Starting emulator: $AVDS${NC}"
    emulator -avd "$AVDS" -no-snapshot-load &

    echo "Waiting for emulator to boot (this may take 60 seconds)..."
    adb wait-for-device
    sleep 10
    echo -e "${GREEN}✓${NC} Emulator is ready"
else
    echo -e "${GREEN}✓${NC} Emulator already running"
fi
echo ""

# Step 3: Fix image filename (Android requires lowercase)
echo -e "${YELLOW}Step 3: Fixing Image Filename${NC}"
DRAWABLE_DIR="android/app/src/main/res/drawable"
if [ -f "$DRAWABLE_DIR/Mweli.webp" ]; then
    mv "$DRAWABLE_DIR/Mweli.webp" "$DRAWABLE_DIR/mweli.webp"
    echo -e "${GREEN}✓${NC} Renamed Mweli.webp to mweli.webp (Android requires lowercase)"
else
    echo -e "${GREEN}✓${NC} Image filename already correct"
fi
echo ""

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing Dependencies${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi
echo ""

# Step 5: Clean previous builds
echo -e "${YELLOW}Step 5: Cleaning Previous Builds${NC}"
cd android
./gradlew clean -q || echo "Clean completed with warnings"
cd ..
echo -e "${GREEN}✓${NC} Build cleaned"
echo ""

# Step 6: Build APK
echo -e "${YELLOW}Step 6: Building Debug APK${NC}"
echo "This may take 5-10 minutes on first build..."
cd android
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}ERROR: APK not created${NC}"
    exit 1
fi

SIZE=$(du -h "$APK_PATH" | cut -f1)
echo -e "${GREEN}✓${NC} APK built successfully: $SIZE"
cd ..
echo ""

# Step 7: Install APK
echo -e "${YELLOW}Step 7: Installing APK on Emulator${NC}"
adb install -r "android/$APK_PATH"
echo -e "${GREEN}✓${NC} APK installed"
echo ""

# Step 8: Start Metro bundler in background
echo -e "${YELLOW}Step 8: Starting Metro Bundler${NC}"
# Kill any existing Metro processes
pkill -f "react-native start" || true
sleep 2

# Start Metro in background
npm start &
METRO_PID=$!
echo -e "${GREEN}✓${NC} Metro bundler started (PID: $METRO_PID)"
echo "Waiting for Metro to initialize..."
sleep 10
echo ""

# Step 9: Launch app
echo -e "${YELLOW}Step 9: Launching App${NC}"
adb shell am start -n com.mkwelimobile/.MainActivity
echo -e "${GREEN}✓${NC} App launched"
echo ""

echo -e "${GREEN}=========================================="
echo "BUILD & RUN COMPLETE!"
echo "=========================================${NC}"
echo ""
echo "The MkweliMobile app is now running on your virtual device."
echo ""
echo "Test the sanctions screening:"
echo "  1. Enter a name in the search box (placeholder: MKweliAML)"
echo "  2. Try sanctioned names like 'Vladimir Putin' or 'Kim Jong Un'"
echo "  3. Try regular names like 'John Smith'"
echo ""
echo "To view logs:"
echo "  adb logcat | grep -i mkweli"
echo ""
echo "To stop Metro bundler:"
echo "  kill $METRO_PID"
echo ""
echo -e "${BLUE}Status: APP RUNNING${NC}"
echo ""
