# Changelog

Notable changes to Mkweli Mobile, built from the git history. Dates are commit dates.
Versions that have no dedicated commit (1.0.7, 1.0.10, 1.0.11) are not listed.

## 1.0.17 (2026-10-08)
- **New release signing key.** The previous key was exposed in this repo and is treated as compromised. Releases are now signed in CI from GitHub secrets with a new key plus an APK Signature Scheme v3 rotation lineage: Android 9+ moves to the new key (and then refuses updates signed only by the old one); Android 7–8 still verify the old key, so existing installs update without reinstalling. Keystores and passwords removed from the repo.
- **Dependencies:** Dependabot security updates (fast-xml-parser, Babel, React Native CLI 20.2.0 incl. cli-platform-android, and transitive packages); removed unused fast-xml-parser, react-native-safe-area-context and @react-native/new-app-screen. `npm audit` critical findings: 2 → 0.
- **CI and code health:** new CI workflow (lint, type-check, tests on every push to main and PR); ESLint config added and errors fixed; TypeScript errors fixed; unit tests no longer make real network downloads (fixes the Jest worker hang).
- **Housekeeping:** old APKs (v1.0.8, v1.0.12–1.0.15) removed from the repo, README Git LFS note fixed, unused async-storage mock removed, this changelog added.

## 1.0.16 (2026-10-03)
- "Names loaded" and the post-update total names line are now rendered from the same saved UN + EU + UK + USA sum, including after a language change.
- The release workflow names the APK from `versionName` and installs the Android SDK pieces it needs; SHA-256 of the v1.0.16 APK recorded in the README.

## 1.0.15 (2026-09-01)
- The home card and the update message now use the same per-source name count, so totals match after **Update lists**.
- Added the manually triggered **Build signed release APK** GitHub Actions workflow.

## 2026-08-28
- README no longer describes the product as open source; the APK remains a signed sideload build from the product site.

## 1.0.14 (2026-08-21)
- UK: the official FCDO CSV (~50 MB, runs phones out of memory) is skipped; the OpenSanctions names extract of the same UK list is used. Non-Latin names are read too.

## 1.0.13 (2026-08-21)
- EU: hanging webgate downloads are aborted after 15 s, falling back to OpenSanctions mirrors of the same list.
- Demo shortcuts replaced with **Clear all searches**.

## 1.0.12 (2026-07-28)
- Token matching ("Phase A"): name parts match in any order with ranked strong/possible scores, so surname-only and reversed-name queries find list entries.
- README points downloads and the published SHA-256 at the official host, aml.mkweli.tech; UK source named FCDO.

## 1.0.9 (2026-07-27)
- Mkweli rebrand: new adaptive launcher icons, logo mark and wordmark, sharp light/dark logo variants.
- Fixed a JSX comment that broke the release JS bundle.

## 1.0.8 (2026-07-16)
- Stable sideload build (not on Google Play): New Architecture off, native libs extracted for OEM phones, no Google Play Services dependency (works on Huawei / non-GMS devices).
- Lists auto-update every 30 days on open (manual update kept); UTF-8-safe streamed parsing; fetch / XHR / RNFS downloads with redirects; USA falls back to the OpenSanctions CDN when OFAC hosts are blocked.
- `react-native-fs` postinstall patch for RN 0.83.
- Removed obsolete docs, scripts and bulk list archives; README refreshed.

## 2026-07-14
- EU, UK and USA lists switched to CSV (UN stays XML), with OFAC downloaded first; CSV parsing tests added.

## 1.0.6 (2026-07-13)
- First release in this history: on-device UN / EU / UK / USA list updates, How-to-use page, EN / FR / PT / ES UI, signed APKs.
