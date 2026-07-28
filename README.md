# Mkweli Mobile

Open-source **AML name screening** app for Android (and iOS).  
Distributed via **GitHub** as a signed APK — **not** on the Google Play Store. Works on Google and non-Google devices (including Huawei without GMS).

| | |
|---|---|
| **Version** | **1.0.12** (`versionCode` 12) |
| **Package** | `com.mkwelimobile` |
| **Product site** | **[aml.mkweli.tech](https://aml.mkweli.tech/)** |
| **Download APK** | **[Mkweli_v1.0.12.apk](https://aml.mkweli.tech/Mkweli_v1.0.12.apk)** (official host only) |
| **SHA-256** | `c3ca9da655a5ce2bf219b89f1396042278b87d014fb3ca789547b411d8243228` |
| **Support** | [support@mkweli.tech](mailto:support@mkweli.tech) |
| **Stack** | React Native 0.83 · Hermes · minSdk 24 |

## Features

- Screen a person or organisation name against **UN**, **EU**, **UK (FCDO)**, and **USA (OFAC SDN)** lists
- **Token matching** (name parts, any order) with ranked strong/possible scores; surname-only and partial queries supported
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
| UK (FCDO) | CSV | UK Sanctions List from `sanctionslist.fcdo.gov.uk` |

## Install the APK (end users)

1. Download **[Mkweli_v1.0.12.apk](https://aml.mkweli.tech/Mkweli_v1.0.12.apk)** from the official product site.
2. Optionally verify the SHA-256 above matches the file you downloaded.
3. On Android, allow install from the browser/file manager if prompted.
4. Open the app on Wi‑Fi so lists can auto-update (USA can take a minute if using the CDN fallback).

ABIs included: **armeabi-v7a** + **arm64-v8a** (typical phones). Not on the Google Play Store.

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
cp app/build/outputs/apk/release/app-release.apk app/Mkweli_v1.0.12.apk
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
