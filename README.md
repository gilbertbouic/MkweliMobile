# MkweliMobile

Mobile sanctions screening app built with React Native.

## Release

- Release version: `v1.0.8`
- Android `versionName`: `1.0.8`
- Android `versionCode`: `8`
- iOS `MARKETING_VERSION`: `1.0.8`
- iOS `CURRENT_PROJECT_VERSION`: `8`

## What This App Does

- Screens names against sanctions data bundled in `assets/sanctions/` and `src/sanctions/`.
- Supports multilingual UI strings through `src/i18n/`.
- Runs on Android and iOS with React Native `0.83.1`.
- Routes startup safely for Google and non-Google device profiles in Android native initialization.

## Prerequisites

- Node.js `>=20`
- npm
- Android Studio + Android SDK (for Android builds)
- Xcode + CocoaPods (for iOS builds)

## Install

```bash
cd /home/gil/MkweliMobile
npm install
```

For iOS dependencies:

```bash
cd /home/gil/MkweliMobile/ios
bundle install
bundle exec pod install
```

## Run In Development

Start Metro:

```bash
cd /home/gil/MkweliMobile
npm start
```

Run Android (new terminal):

```bash
cd /home/gil/MkweliMobile
npm run android
```

Run iOS (macOS only, new terminal):

```bash
cd /home/gil/MkweliMobile
npm run ios
```

## Build

Android debug/release helper scripts are available at project root, including:

- `build-apk.sh`
- `build-apk-quick.sh`
- `build-apk-gradle9.sh`
- `final-integration-build.sh`

Primary Android Gradle module path: `android/app/`.

## Test

Run the Jest test suite:

```bash
cd /home/gil/MkweliMobile
npm test
```

## Project Structure

- `App.tsx`: main app UI and flow
- `src/sanctions/`: sanctions domain logic
- `src/i18n/`: localization resources
- `android/`: Android native project
- `ios/`: iOS native project
- `__tests__/`: automated tests
- `assets/sanctions/`: bundled sanctions source files

## Notes

- For Android release signing, use keystore properties expected by `android/app/build.gradle`.
- Build and verification guides are documented in the root markdown files (for example `BUILD-AND-RUN-GUIDE.md`, `APK-BUILD-GUIDE.md`, and `TESTING-GUIDE.md`).
