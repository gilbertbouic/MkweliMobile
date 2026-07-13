# EMULATOR QUICK REFERENCE & TROUBLESHOOTING

**Quick Start**: 60 seconds  
**Full Setup**: 5-10 minutes  
**Status**: Ready to configure

---

## ⚡ FASTEST WAY TO RUN APP

### Option 1: Fully Automated (Recommended)
```bash
cd /home/gil/MkweliMobile
chmod +x setup-emulator.sh
./setup-emulator.sh
```

**Does Everything**:
- ✅ Checks Android SDK
- ✅ Creates/updates virtual device
- ✅ Starts emulator
- ✅ Waits for boot
- ✅ Builds app
- ✅ Installs app
- ✅ Launches app

**Time**: 3-5 minutes
**Result**: App running on emulator

---

### Option 2: Quick Manual Setup
```bash
# Terminal 1: Start Metro Bundler
npm start

# Terminal 2: Run on emulator
npm run android
```

**Time**: 2-3 minutes
**Result**: App launches automatically

---

### Option 3: Step-by-Step Manual
```bash
# 1. Start emulator
emulator -avd MkweliEmulator &

# 2. Wait for device to appear
adb devices

# 3. Build app
npm run android

# 4. App launches automatically
```

---

## 🎮 TESTING THE APP

### In Emulator Terminal
1. Tap on input field
2. Type: "Vladimir Putin"
3. Tap "Screen" button
4. **Expected**: Red message "Sanctioned: Match found in database."

### Test Again
1. Clear input (select all + delete)
2. Type: "John Smith"
3. Tap "Screen" button
4. **Expected**: Green message "Not sanctioned: No match found."

### Test Dark Mode
1. Swipe down from top of screen
2. Find "Theme" or "Display" settings
3. Toggle dark mode
4. App should adapt automatically

---

## 📊 COMMON COMMANDS

### Emulator Management
```bash
# List connected devices
adb devices

# List available AVDs
emulator -list-avds

# Start specific emulator
emulator -avd MkweliEmulator &

# Stop emulator
adb emu kill

# Restart ADB
adb kill-server && adb start-server
```

### App Management
```bash
# Build app
npm run android

# Install only
cd android && ./gradlew installDebug

# Uninstall
adb uninstall com.mkwelimobile

# Clear app data
adb shell pm clear com.mkwelimobile

# Launch manually
adb shell am start -n com.mkwelimobile/.MainActivity

# Stop app
adb shell am force-stop com.mkwelimobile
```

### Debugging
```bash
# View logs
adb logcat

# Filter logs
adb logcat | grep MkweliMobile

# Save logs
adb logcat > app.log

# Device info
adb shell getprop ro.build.version.android

# Emulator specs
emulator -avd MkweliEmulator -show-kernel
```

---

## 🔧 ENVIRONMENT SETUP

### Check Prerequisites
```bash
# Node.js
node --version

# npm
npm --version

# Android SDK
echo $ANDROID_HOME
ls $ANDROID_HOME

# Gradle
cd android && ./gradlew --version

# Java
java -version
```

### Set Environment (Linux/Mac)
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### Set Environment (Windows)
```
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
PATH += %ANDROID_HOME%\emulator
PATH += %ANDROID_HOME%\platform-tools
PATH += %ANDROID_HOME%\tools\bin
```

---

## ⚠️ TROUBLESHOOTING

### "Emulator not found"
```bash
# Install it
android avdmanager create avd \
  --name "MkweliEmulator" \
  --package "system-images;android-34;default;x86_64"
```

### "Device offline"
```bash
# Restart ADB
adb kill-server
adb start-server
adb devices
```

### "App won't install"
```bash
# Clean and rebuild
npm run android -- --clear-cache
```

### "Emulator too slow"
```bash
# Use x86_64 instead of ARM
# Or reduce memory
emulator -avd MkweliEmulator -memory 1024
```

### "KVM not installed (Linux)"
```bash
# Install KVM
sudo apt-get install qemu-kvm libvirt-daemon-system
sudo usermod -a -G kvm $USER
newgrp kvm
```

### "Can't find Metro bundler port"
```bash
# Kill any existing Metro
lsof -i :8081
kill -9 <PID>

# Restart
npm start
```

---

## 🎯 SUCCESS CHECKLIST

Run these to verify setup:

```bash
# 1. Check SDK
echo $ANDROID_HOME

# 2. Check emulator
emulator -list-avds

# 3. Check connected devices
adb devices

# 4. Check app
ls android/app/build/outputs/apk/debug/app-debug.apk

# 5. Test app
npm run android
```

All should complete without errors.

---

## 📱 EMULATOR FEATURES

### Keyboard Shortcuts
```
Ctrl+M        Toggle menu
Volume Up     Volume up
Volume Down   Volume down
Home          Home button
Back          Back button
Power         Power button
Rotation      Rotate screen
```

### Features
- Multi-touch gestures
- GPS location simulation
- Battery level control
- Network simulation
- Camera simulation
- Sensor simulation

---

## 📈 PERFORMANCE TIPS

### Speed Up Emulator
1. Use x86_64 CPU (faster than ARM)
2. Enable GPU acceleration
3. Allocate enough RAM (2GB minimum)
4. Use SSD for AVD storage
5. Close other apps

### Configuration File
Edit `~/.android/avd/MkweliEmulator.avd/config.ini`:
```ini
hw.gpu.mode=auto
hw.gpu.enabled=yes
hw.ramSize=2048
vm.heapSize=512
```

---

## 🚀 NEXT STEPS

1. **Run setup script**:
   ```bash
   ./setup-emulator.sh
   ```

2. **Or manual setup**:
   ```bash
   npm start        # Terminal 1
   npm run android  # Terminal 2
   ```

3. **Test the app**:
   - Enter name
   - Tap "Screen" button
   - See result

---

## 📞 QUICK HELP

| Issue | Solution |
|-------|----------|
| Emulator won't start | Check ANDROID_HOME is set |
| App won't install | Run: `npm run android -- --clear-cache` |
| Logs show errors | Check: `adb logcat \| grep MkweliMobile` |
| Emulator too slow | Use x86_64, enable GPU |
| Device offline | Run: `adb kill-server && adb start-server` |

---

**Files Created**:
- ✅ `local.properties` - SDK configuration
- ✅ `EMULATOR-SETUP-GUIDE.md` - Detailed guide
- ✅ `setup-emulator.sh` - Automated setup script
- ✅ This file - Quick reference

**Status**: ✅ **READY FOR EMULATOR CONFIGURATION**

🚀 **RUN YOUR APP ON VIRTUAL DEVICE!**

