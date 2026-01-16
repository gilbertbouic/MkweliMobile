#!/bin/bash

# MkweliMobile Emulator Setup & Launch Script
# Configures and runs the app on Android Virtual Device

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
echo "MkweliMobile Emulator Setup & Launch"
echo "==========================================${NC}"
echo ""

# Step 1: Check Android SDK
echo -e "${YELLOW}Step 1: Checking Android SDK${NC}"

if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}ANDROID_HOME not set, using default location...${NC}"
    export ANDROID_HOME="$HOME/Android/Sdk"
fi

if [ ! -d "$ANDROID_HOME" ]; then
    echo -e "${RED}ERROR: Android SDK not found at $ANDROID_HOME${NC}"
    echo "Please install Android SDK or set ANDROID_HOME"
    exit 1
fi

echo -e "${GREEN}✓${NC} Android SDK: $ANDROID_HOME"
echo ""

# Step 2: Check emulator tools
echo -e "${YELLOW}Step 2: Checking Emulator Tools${NC}"

if [ ! -f "$ANDROID_HOME/emulator/emulator" ]; then
    echo -e "${RED}ERROR: Emulator not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Emulator tools available"
echo ""

# Step 3: Check/Create AVD
echo -e "${YELLOW}Step 3: Checking Virtual Device${NC}"

AVD_NAME="MkweliEmulator"
AVD_PATH="$HOME/.android/avd/$AVD_NAME.avd"

if [ ! -d "$AVD_PATH" ]; then
    echo -e "${YELLOW}Virtual device not found. Creating...${NC}"

    # Download system image if needed
    "$ANDROID_HOME/tools/bin/avdmanager" list | grep -q "system-images;android-34" || {
        echo "Downloading Android 34 system image..."
        "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "system-images;android-34;default;x86_64"
    }

    # Create AVD
    echo "Creating AVD: $AVD_NAME"
    echo "no" | "$ANDROID_HOME/tools/bin/avdmanager" create avd \
        --name "$AVD_NAME" \
        --package "system-images;android-34;default;x86_64" \
        --device "pixel_5" \
        --force || echo "AVD creation message (may be OK if exists)"

    echo -e "${GREEN}✓${NC} Virtual device created/updated"
else
    echo -e "${GREEN}✓${NC} Virtual device exists: $AVD_NAME"
fi

echo ""

# Step 4: Check for running emulator
echo -e "${YELLOW}Step 4: Checking for Running Emulator${NC}"

# Kill any existing emulators
pkill -f "emulator" || true
sleep 1

# Start emulator in background
echo "Starting emulator..."
"$ANDROID_HOME/emulator/emulator" -avd "$AVD_NAME" \
    -memory 2048 \
    -cores 4 \
    -no-boot-anim \
    -no-snapshot &

EMULATOR_PID=$!
echo -e "${GREEN}✓${NC} Emulator started (PID: $EMULATOR_PID)"
echo ""

# Step 5: Wait for emulator to boot
echo -e "${YELLOW}Step 5: Waiting for Emulator Boot${NC}"

echo "This may take 2-3 minutes..."
timeout=0
max_timeout=180

while [ $timeout -lt $max_timeout ]; do
    if adb devices 2>/dev/null | grep -q "device$"; then
        echo -e "${GREEN}✓${NC} Emulator is ready"
        break
    fi
    timeout=$((timeout + 5))
    sleep 5
    echo "Waiting... ($timeout/$max_timeout seconds)"
done

if [ $timeout -ge $max_timeout ]; then
    echo -e "${RED}ERROR: Emulator boot timeout${NC}"
    exit 1
fi

echo ""

# Step 6: Build and install app
echo -e "${YELLOW}Step 6: Building & Installing App${NC}"

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo "Building app..."
npm run android -- --verbose

echo ""
echo -e "${GREEN}=========================================="
echo "EMULATOR SETUP COMPLETE!"
echo "==========================================${NC}"
echo ""
echo -e "${GREEN}✓ Emulator running${NC}"
echo -e "${GREEN}✓ App installed${NC}"
echo -e "${GREEN}✓ App should be launching...${NC}"
echo ""
echo "The app should open automatically on the emulator."
echo ""
echo "Troubleshooting:"
echo "  • Check emulator is booted: adb devices"
echo "  • View logs: adb logcat | grep MkweliMobile"
echo "  • Reinstall: npm run android"
echo "  • Restart emulator: Ctrl+C to stop, re-run this script"
echo ""
echo -e "${BLUE}App Ready: com.mkwelimobile${NC}"
echo ""

