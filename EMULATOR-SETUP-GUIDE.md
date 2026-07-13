# VIRTUAL DEVICE SETUP & CONFIGURATION GUIDE

**Date**: January 15, 2026  
**App**: MkweliMobile AML Sanctions Screening  
**Platform**: Android Virtual Device (Emulator)  
**Status**: ✅ READY TO CONFIGURE

---

## 🎯 QUICK START - RUN ON EMULATOR

### Prerequisites Check
```bash
# 1. Verify Android SDK is installed
ls ~/Android/Sdk

# 2. Verify emulator tools exist
ls ~/Android/Sdk/emulator
ls ~/Android/Sdk/tools/bin

# 3. Verify Node.js
node --version  # Should be >= 20

# 4. Verify npm
npm --version
```

### Method 1: Quick Start (Automated)
```bash
# From project root
npm start
```

In another terminal:
```bash
# This will automatically find/create/start emulator
npm run android
```

**Expected**: App launches on emulator in 2-3 minutes

---

## 🛠️ METHOD 2: MANUAL SETUP (RECOMMENDED FOR FIRST TIME)

### Step 1: Create Virtual Device (5-10 minutes)

#### Check Existing Devices
```bash
~/.android/avd/
```

#### Create New Emulator (if needed)
```bash
# List available system images
~/Android/Sdk/tools/bin/avdmanager list

# Create new AVD (API 34, recommended)
~/Android/Sdk/tools/bin/avdmanager create avd \
  --name "MkweliEmulator" \
  --package "system-images;android-34;default;x86_64" \
  --device "pixel_5"
```

**What this creates**:
- Device Name: MkweliEmulator
- Android Version: 34 (latest stable)
- CPU: x86_64 (fast emulation on x64 systems)
- Device Profile: Pixel 5 (realistic phone)

#### Alternative: Use Android Studio GUI
```bash
# Open Android Studio if available
studio.sh
```

Then:
1. Tools → Device Manager
2. Create Device
3. Select Pixel 5 (Phone)
4. Choose API 34
5. Finish

---

### Step 2: Start Virtual Device

#### Start Emulator
```bash
# Method A: Quick start
emulator -avd MkweliEmulator &

# Method B: With specific options
emulator -avd MkweliEmulator \
  -memory 2048 \
  -cores 4 \
  -no-boot-anim &

# Method C: From Android Sdk
~/Android/Sdk/emulator/emulator -avd MkweliEmulator &
```

**Wait for**: Emulator to fully boot (2-3 minutes)

#### Check Device is Ready
```bash
# List connected devices
adb devices

# Expected output:
# List of attached devices
# emulator-5554          device
```

---

### Step 3: Install & Run App

#### Build and Install APK
```bash
cd /home/gil/MkweliMobile

# Method A: Automatic (recommended)
npm run android

# Method B: Manual Gradle
cd android
./gradlew installDebug
cd ..

# Method C: Build then install
npm run android
```

**Expected**: 
- App builds
- APK installs on emulator
- App launches automatically

#### Manual Testing (Alternative)
```bash
# Build APK first
npm run android -- --verbose

# Or manually:
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
cd ..

# Launch app manually
adb shell am start -n com.mkwelimobile/.MainActivity
```

---

## 🎮 EMULATOR CONTROLS & TESTING

### Navigate in App
- **Type**: Use keyboard in emulator
- **Tap**: Click with mouse
- **Swipe**: Click and drag

### Test Screening Function
1. **Open App** - Should see "AML Sanctions Screening" title
2. **Enter Test Name 1**: Type "Vladimir Putin"
   - Expected: Red message "Sanctioned: Match found in database."
3. **Enter Test Name 2**: Type "John Smith"
   - Expected: Green message "Not sanctioned: No match found."
4. **Test Dark Mode**: Swipe down from top → Settings → Change theme
5. **Test Input**: Try various name formats

### View Logs
```bash
# Real-time logs
adb logcat

# Filter MkweliMobile logs
adb logcat | grep MkweliMobile

# Save logs to file
adb logcat > emulator.log
```

### Performance Testing
```bash
# Check performance
adb shell dumpsys cpuinfo

# Memory usage
adb shell dumpsys meminfo com.mkwelimobile

# Battery usage
adb shell dumpsys batterystats
```

---

## 🖥️ EMULATOR CONFIGURATION

### Emulator Features
Create `~/.android/avd/MkweliEmulator.avd/config.ini`:

```ini
# Display settings
hw.lcd.density=420
hw.lcd.height=2560
hw.lcd.width=1440

# Memory settings
hw.ramSize=2048
vm.heapSize=512

# Performance
hw.gpu.mode=auto
hw.gpu.enabled=yes
hw.keyboard=yes
hw.sensors.proximity=yes
hw.sensors.orientation=yes
hw.battery=yes

# Features
hw.camera.front=yes
hw.camera.back=yes
hw.wifi=yes
hw.mainKeys=no

# System
ro.secure=0
ro.debuggable=1
```

---

## 📱 RECOMMENDED EMULATOR SPECS

### For Optimal Performance
```
Device: Pixel 5 or Pixel 6
API Level: 34 (Android 14)
CPU: x86_64 (faster than ARM)
RAM: 2GB minimum, 4GB recommended
Storage: 4GB
GPU: Enabled (if supported)
```

### System Requirements
```
Processor: Intel i5+ or equivalent
RAM: 8GB+ on host system
Free Disk Space: 10GB+
CPU Virtualization: Enabled in BIOS
```

---

## 🔧 TROUBLESHOOTING

### Emulator Won't Start

**Error**: "emulator: ERROR: Could not find AVD..."
```bash
# Solution 1: Create the AVD
~/Android/Sdk/tools/bin/avdmanager create avd \
  --name "MkweliEmulator" \
  --package "system-images;android-34;default;x86_64"

# Solution 2: List available images
~/Android/Sdk/tools/bin/avdmanager list

# Solution 3: Check AVD location
ls -la ~/.android/avd/
```

**Error**: "emulator: ERROR: KVM is not installed"
```bash
# Solution: Install KVM (Linux)
sudo apt-get install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils

# Enable KVM
sudo usermod -a -G kvm $USER
newgrp kvm
```

**Error**: "Emulator is too slow"
```bash
# Use x86_64 instead of ARM
# Or reduce emulator memory
emulator -avd MkweliEmulator -memory 1024
```

### App Won't Install

**Error**: "INSTALL_FAILED_INVALID_APK"
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Error**: "Device offline"
```bash
# Restart adb
adb kill-server
adb start-server
adb devices
```

### App Crashes on Launch

**Check Logs**:
```bash
adb logcat | grep MkweliMobile
```

**Common Issues**:
- Missing permissions: Check AndroidManifest.xml
- Bad JSON: Verify JSON files in assets/
- Missing resources: Rebuild app

---

## 📊 PERFORMANCE BENCHMARKS

### Expected Performance on Emulator

| Operation | Time | Status |
|-----------|------|--------|
| Emulator Boot | 60-90s | ✅ Normal |
| App Install | 20-30s | ✅ Normal |
| App Launch | 5-10s | ✅ Normal |
| Name Lookup | <1ms | ✅ Fast |
| Screen Rotation | Instant | ✅ Fast |
| Dark Mode Switch | <100ms | ✅ Fast |

### Optimization Tips

**Speed Up Emulator**:
```bash
# Use x86_64 CPU (vs ARM)
# Enable GPU acceleration
# Increase RAM allocation
# Use SSD for AVD storage
# Close other apps
```

---

## 📋 COMPLETE EMULATOR SETUP CHECKLIST

### Initial Setup
- [ ] Android SDK installed
- [ ] Emulator tools available
- [ ] local.properties configured
- [ ] gradle.properties configured

### Virtual Device
- [ ] AVD created (or existing)
- [ ] API level 34+
- [ ] CPU: x86_64 (recommended)
- [ ] RAM: 2GB+ allocated

### App Configuration
- [ ] npm dependencies installed
- [ ] Build configuration valid
- [ ] No TypeScript errors
- [ ] All resources present

### Testing
- [ ] Emulator boots successfully
- [ ] App installs without errors
- [ ] App launches correctly
- [ ] Screening function works
- [ ] Dark mode works

---

## 🚀 QUICK COMMAND REFERENCE

### Start Everything
```bash
# Terminal 1: Metro bundler
npm start

# Terminal 2: Run on emulator (auto-creates if needed)
npm run android
```

### Manual Control
```bash
# Start emulator manually
emulator -avd MkweliEmulator &

# List connected devices
adb devices

# Build and install
npm run android

# View logs
adb logcat | grep MkweliMobile

# Clear app data
adb shell pm clear com.mkwelimobile

# Uninstall app
adb uninstall com.mkwelimobile

# Reboot emulator
adb reboot
```

---

## 🎯 NEXT STEPS

### Immediate
1. Verify Android SDK location
2. Create virtual device
3. Start emulator
4. Run app: `npm run android`

### Testing
1. Enter sanctioned name: "Vladimir Putin"
2. Verify red message displays
3. Enter non-sanctioned name: "John Smith"
4. Verify green message displays
5. Test dark/light mode toggle

### Optimization
1. Adjust emulator memory if slow
2. Enable GPU acceleration if available
3. Test on different API levels

---

## 📖 ADDITIONAL RESOURCES

**Android Emulator Docs**:
https://developer.android.com/studio/run/emulator

**AVD Manager Docs**:
https://developer.android.com/studio/run/managing-avds

**Gradle Plugin Docs**:
https://developer.android.com/studio/build

**React Native Android Docs**:
https://reactnative.dev/docs/running-on-device

---

## 🎉 SUCCESS INDICATORS

When configured correctly, you'll see:
- ✅ Emulator boots and shows Android home screen
- ✅ App appears in emulator
- ✅ App shows "AML Sanctions Screening" title
- ✅ Input field accepts text
- ✅ "Screen" button responds to taps
- ✅ Results display correctly (red/green)
- ✅ Dark/light mode switches
- ✅ No errors in console

---

**Status**: ✅ **READY FOR EMULATOR CONFIGURATION**  
**Configuration File**: `local.properties` created  
**Next Action**: Follow setup steps above  

🚀 **READY TO RUN ON VIRTUAL DEVICE!**

