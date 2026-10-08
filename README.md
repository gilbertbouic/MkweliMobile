# Mkweli Mobile

**AML name screening** app for Android (and iOS).  
Distributed as a signed APK from the product site — **not** on the Google Play Store. Works on Google and non-Google devices (including Huawei without GMS).

| | |
|---|---|
| **Version** | **1.0.16** (`versionCode` 16) |
| **Package** | `com.mkwelimobile` |
| **Product site** | **[aml.mkweli.tech](https://aml.mkweli.tech/)** |
| **Download APK** | **[Mkweli_v1.0.16.apk](https://aml.mkweli.tech/Mkweli_v1.0.16.apk)** (official host only) |
| **SHA-256** | `e1751cd8d9970499ee24f3f32edc33ac20c0c34e6dc59b085701a381fc767dbc` |
| **Support** | [support@mkweli.tech](mailto:support@mkweli.tech) |
| **Stack** | React Native 0.83 · Hermes · minSdk 24 |

## Features

- Screen a person or organisation name against **UN**, **EU**, **UK (FCDO)**, and **USA (OFAC SDN)** lists
- **Token matching** (name parts, any order) with ranked strong/possible scores; surname-only and partial queries supported
- **Auto-update every 30 days** on open when lists are stale or still seed data (manual **Update lists** anytime)
- **Names loaded** and the post-update **total names** line are rendered from the same saved sum (UN + EU + UK + USA), including after a language change
- Offline screening after the first successful download (or using bundled seed names)
- UI languages: **EN / FR / PT / ES**
- Temporary download files are deleted after parse; per-source failures keep the previous good list

### List sources

| Source | Format | Notes |
|--------|--------|--------|
| USA (OFAC SDN) | CSV | Official Treasury/OFAC URLs first; **OpenSanctions CDN** fallback when OFAC hosts are blocked |
| UN | XML | UN Security Council consolidated list |
| EU | CSV (`;`) | Official FSD URL first (fails fast if `webgate.ec.europa.eu` hangs); **OpenSanctions CDN** fallback |
| UK (FCDO) | CSV | Official FCDO CSV is ~50MB (full statements of reasons) and is skipped on device; **OpenSanctions CDN** names extract of the same list is used |

## Install the APK (end users)

1. Download **[Mkweli_v1.0.16.apk](https://aml.mkweli.tech/Mkweli_v1.0.16.apk)** from the official product site.
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

### Release signing (maintainers)

No signing keys or passwords are stored in this repository.

- **Where the key lives:** the release keystore, its passwords/alias, and the key-rotation lineage are stored only as GitHub Actions repository secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_SIGNING_LINEAGE_BASE64`, plus `OLD_ANDROID_*` for the previous key). Secrets are write-only, so the maintainer keeps an offline backup of the same files.
- **How releases are signed:** run the **Build signed release APK** workflow (Actions → *Build signed release APK* → *Run workflow*). It decodes the keystore from secrets, runs `./gradlew :app:assembleRelease`, then re-signs with `apksigner` using the signing lineage, verifies the signature, deletes the key material, and uploads `Mkweli_v<versionName>.apk` + its SHA-256 as an artifact.
- **Key rotation (October 2026):** the previous release key was exposed in this public repo and is treated as compromised. The next release after v1.0.16 (and every later one) is signed with a new key using APK Signature Scheme v3 key rotation: Android 9+ devices verify the new key via the lineage (and, once updated, will not accept updates signed only by the old key); Android 7.0–8.1 devices still verify the v2 signature made with the old key, so existing installs keep updating without a reinstall. Drop the old signer once `minSdkVersion` is raised to 28.
- **Local release builds:** set `MKWELI_UPLOAD_STORE_FILE` (absolute path), `MKWELI_UPLOAD_STORE_PASSWORD`, `MKWELI_UPLOAD_KEY_ALIAS`, `MKWELI_UPLOAD_KEY_PASSWORD` as environment variables or in your personal `~/.gradle/gradle.properties` (never in the repo). Without them `assembleRelease` produces an unsigned APK; it never falls back to the debug key. Apply the lineage with `apksigner sign --rotation-min-sdk-version 28 --lineage …` as in `.github/workflows/release-apk.yml`.

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
- No Google Play Services dependency — suitable for sideload / non-Play distribution.
- Screening is **not** fuzzy matching and is **not** a full KYC system; follow your organisation’s compliance policy.

## License

Copyright © 2026 Mkweli. All rights reserved. Source in this repository is for product development and is not licensed for reuse.
