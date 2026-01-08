# Mkweli-Mobile

This is the official **Mobile Client App for [MkweliAML](https://github.com/gilbertbouic/Mkweli)**. The app connects to the backend API to provide seamless Anti-Money Laundering (AML) screening functionality on mobile platforms.

---

## Features:
- **KYC Sanctions Screening**: Direct API integration for fuzzy matching, SHA256-secure reports.
- **Offline-first Capability**: Works even when the backend is offline.
- **Cross-platform Support**: Android and iOS supported.
  
---

## Prerequisites:
- **Node.js**: 18.x or later
- **NPM**: (installed with Node.js)
- **React Native CLI**: Latest version (`npm install -g react-native`)

---

## Setup (Development):
1. Clone the repository:
   ```
   git clone https://github.com/gilbertbouic/Mkweli-Mobile.git
   cd Mkweli-Mobile
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the app:
   On Android:
   ```
   npx react-native run-android
   ```
   On iOS:
   ```
   npx react-native run-ios
   ```

4. Connect the app to the backend API:
   - Update `BASE_URL` in `src/config.js` with the IP or domain where the backend is hosted.
---

## Contributing
Contributions are welcome. Please create a fork and submit pull requests.

--- 

## License
Released under the MIT License.
