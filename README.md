# Mkweli Mobile

Open-source **AML name screening** app for Android (and iOS).  
Distributed via **GitHub** as a signed APK — **not** on the Google Play Store. Works on Google and non-Google devices (including Huawei without GMS).

| | |
|---|---|
| **Version** | **1.0.8** (`versionCode` 8) |
| **Package** | `com.mkwelimobile` |
| **Release APK** | [`android/app/Mkweli_v1.0.8.apk`](android/app/Mkweli_v1.0.8.apk) (Git LFS) |
| **Stack** | React Native 0.83 · Hermes · minSdk 24 |

## Features

- Screen a person or organisation name against **UN**, **EU**, **UK**, and **USA (OFAC SDN)** lists
- **Exact** match only (case-insensitive, trimmed)
- **Auto-update every 30 days** on open when lists are stale or still seed data (manual **Update lists** anytime)
- Offline screening after the first successful download (or using bundled seed names)
- UI languages: **EN / FR / PT / ES**
- Temporary download files are deleted after parse; per-source failures keep the previous good list

### List sources

| Source | Format | Notes |
|--------|--------|--------|
| USA (OFAC SDN) | CSV | Official Treasury/OFAC URLs first; **OpenSanctions CDN** fallback when OFAC hosts are blocked |
| UN | XML | UN Security Council consolidated list |
| EU | CSV (`;`) | EU FSD full list (`Naal_wholename`) |
| UK | CSV | OFSI list (`Name 1`…`Name 6`) |

## Install the APK (end users)

1. Download **[Mkweli_v1.0.8.apk](https://github.com/gilbertbouic/MkweliMobile/raw/main/android/app/Mkweli_v1.0.8.apk)** from this repository (Git LFS).
2. On Android, allow install from the browser/file manager if prompted.
3. Open the app on Wi‑Fi for the first automatic list update (USA can take a minute if using the CDN fallback).

ABIs included: **armeabi-v7a** + **arm64-v8a** (typical phones).

## Develop

### Prerequisites

- Node.js **≥ 20**, npm  
- Android SDK / Android Studio (Android)  
- Xcode + CocoaPods (iOS, macOS only)

### Setup

```bash
git clone https://github.com/gilbertbouic/MkweliMobile.git
cd MkweliMobile
git lfs pull          # required for the release APK
npm install           # runs postinstall patch for react-native-fs
```

### Run

```bash
npm start             # Metro
npm run android       # another terminal
# npm run ios         # macOS only
```

### Test

```bash
npm test
```

### Release APK (maintainers)

Signing is configured via `android/gradle.properties` (`MYAPP_UPLOAD_*`) and the keystore under `android/keystores/` (not always published).

```bash
cd android
./gradlew :app:assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
cp app/build/outputs/apk/release/app-release.apk app/Mkweli_v1.0.8.apk
```

`postinstall` applies `scripts/patch-rnfs-promise.js` so `react-native-fs` works with RN 0.83 (null error codes + multi-hop redirects).

## Project layout

```
App.tsx                 # Main UI, auto-update on open
InstructionsScreen.tsx  # How to use
sanctions-data.ts       # Screening API + seed load
src/sanctions/          # Download, parse, store (NDJSON)
src/i18n/               # EN / FR / PT / ES
assets/sanctions/       # Bundled seed name lists (*-names.json only)
android/                # Android project + release APK
ios/                    # iOS project
__tests__/              # Jest tests
scripts/                # postinstall patches
```

## Notes

- New Architecture is **off** (`newArchEnabled=false`) for stability with current native modules.
- No Google Play Services dependency — suitable for sideload / open-source distribution.
- Screening is **not** fuzzy matching and is **not** a full KYC system; follow your organisation’s compliance policy.

## License

See repository ownership on GitHub: [gilbertbouic/MkweliMobile](https://github.com/gilbertbouic/MkweliMobile).
