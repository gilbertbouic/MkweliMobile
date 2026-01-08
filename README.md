# Mkweli-Mobile

**Mkweli-Mobile** is the official mobile client application for [MkweliAML](https://github.com/gilbertbouic/Mkweli), providing seamless Anti-Money Laundering (AML) screening functionality on mobile platforms. This React Native application connects to the MkweliAML backend API to deliver powerful KYC and sanctions screening capabilities directly on Android and iOS devices.

---

## 📱 Description

Mkweli-Mobile is a cross-platform mobile client for MkweliAML that enables users to:
- Perform KYC (Know Your Customer) sanctions screening on the go
- Access AML screening features with fuzzy matching capabilities
- Generate SHA256-secure compliance reports
- Work with offline-first capabilities when the backend is temporarily unavailable
- Seamlessly integrate with the MkweliAML backend API

Built with React Native, the app provides a native experience on both Android and iOS platforms while maintaining a single codebase.

---

## ✨ Features

- **KYC Sanctions Screening**: Direct API integration for comprehensive sanctions screening with fuzzy matching algorithms
- **Secure Reports**: SHA256-encrypted compliance reports for enhanced security
- **Offline-first Capability**: Continue working even when the backend is temporarily offline
- **Cross-platform Support**: Native experience on both Android and iOS devices
- **Modern UI**: Intuitive user interface built with React Native components
- **Navigation**: Seamless screen transitions with React Navigation

---

## 📋 Prerequisites

Before setting up Mkweli-Mobile, ensure you have the following installed on your development machine:

### Required Software

1. **Node.js** (v18.x or later)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`
   - npm is included with Node.js

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`
   - Recommended version: 8.x or later

3. **React Native CLI**
   - No need to install globally; we'll use `npx` to run commands
   - The project uses `npx @react-native-community/cli` commands

### Platform-Specific Requirements

#### For Android Development:
- **JDK** (Java Development Kit) 11 or newer
- **Android Studio** with:
  - Android SDK
  - Android SDK Platform 33 or higher
  - Android Virtual Device (AVD) for emulator testing
- **Environment Variables**:
  - `ANDROID_HOME` pointing to your Android SDK location
  - Add platform-tools to your PATH

#### For iOS Development (macOS only):
- **Xcode** 12 or later (from Mac App Store)
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`
- **iOS Simulator** (included with Xcode)

---

## 🚀 Setup Instructions

Follow these steps to set up Mkweli-Mobile for development:

### 1. Clone the Repository

```bash
git clone https://github.com/gilbertbouic/Mkweli-Mobile.git
cd Mkweli-Mobile
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

### 3. iOS-Specific Setup (macOS only)

If you're developing for iOS, install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

### 4. Configure API Backend

The app needs to connect to a MkweliAML backend server. Update the API configuration:

1. Open `src/config.js`
2. Update the `BASE_API_URL` with your backend server address:

```javascript
const Config = {
  BASE_API_URL: 'http://YOUR_BACKEND_IP:5000/api'  // Update this
};

export default Config;
```

**Configuration Examples:**

- **Local development (Android emulator)**: `http://10.0.2.2:5000/api`
- **Local development (iOS simulator)**: `http://localhost:5000/api` or `http://127.0.0.1:5000/api`
- **Real device on same network**: `http://192.168.1.XXX:5000/api` (use your machine's local IP)
- **Production server**: `https://your-domain.com/api`

> **Note**: Android emulators use `10.0.2.2` to access the host machine's localhost. For physical devices, ensure they're on the same network as your backend server.

---

## 🏃 Running the Application

### Start the Metro Bundler

First, start the Metro bundler (React Native's JavaScript bundler):

```bash
npm start
# or
npx react-native start
```

Keep this terminal window open. Open a new terminal for the next steps.

### Run on Android

Make sure you have either:
- An Android device connected via USB with USB debugging enabled, OR
- An Android emulator running

Then run:

```bash
npx react-native run-android
# or
npm run android
```

The app will be installed and launched on your device/emulator automatically.

**Troubleshooting Android:**
- If the app builds but shows a red screen, ensure Metro bundler is running
- For connection errors, verify your `BASE_API_URL` in `src/config.js`
- Run `adb devices` to confirm your device is connected
- Try `adb reverse tcp:5000 tcp:5000` to forward port for localhost backend

### Run on iOS (macOS only)

Make sure you have an iOS simulator installed or a physical iOS device connected.

```bash
npx react-native run-ios
# or
npm run ios
```

To run on a specific simulator:

```bash
npx react-native run-ios --simulator="iPhone 14 Pro"
```

**Troubleshooting iOS:**
- If you encounter build errors, try cleaning: `cd ios && xcodebuild clean && cd ..`
- Ensure CocoaPods are installed: `cd ios && pod install && cd ..`
- For M1/M2 Macs, you may need to use Rosetta for some dependencies

---

## 🔧 Sample API Configuration

To use Mkweli-Mobile with a backend, you need a running instance of MkweliAML. Here's how to set it up:

### Backend Setup

1. **Clone and setup the MkweliAML backend:**

```bash
git clone https://github.com/gilbertbouic/Mkweli.git
cd Mkweli
# Follow backend setup instructions
```

2. **Start the backend server:**

```bash
# Typically runs on port 5000
python app.py  # or your backend start command
```

3. **Update mobile app configuration:**

Edit `src/config.js` in the Mkweli-Mobile project:

```javascript
const Config = {
  BASE_API_URL: 'http://YOUR_IP_ADDRESS:5000/api'
};

export default Config;
```

### API Endpoints Used

The mobile app connects to the following backend endpoints:

- `POST /api/screen` - Perform sanctions screening
- `GET /api/reports` - Retrieve screening reports
- Additional endpoints as defined by the MkweliAML backend

> **Note**: Authentication endpoints (e.g., `/api/auth/login`) may be required depending on your backend configuration. The current app includes a login screen placeholder that can be integrated with your backend's authentication system.

### Network Configuration Tips

- **Development with Physical Device**: Find your computer's local IP address:
  - **Windows**: `ipconfig` (look for IPv4 Address)
  - **macOS/Linux**: `ifconfig` or `ip addr` (look for inet address)
  
- **Production Deployment**: Use HTTPS with a valid SSL certificate for secure API communication

- **CORS Configuration**: Ensure your backend allows requests from mobile origins if needed

---

## 🛠️ Available Scripts

- `npm start` - Start the Metro bundler
- `npm run android` - Build and run on Android device/emulator
- `npm run ios` - Build and run on iOS simulator/device
- `npm test` - Run Jest tests

---

## 📁 Project Structure

```
Mkweli-Mobile/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── config.js        # API configuration
│   ├── screens/         # App screens (Login, Screening)
│   └── services/        # API service layer
├── __tests__/           # Jest test files
├── App.js               # Main app component
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome and appreciated! To contribute:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

Please ensure your code follows the existing style and includes appropriate tests.

---

## 📄 License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🔗 Related Projects

- [MkweliAML Backend](https://github.com/gilbertbouic/Mkweli) - The backend API server for AML screening

---

## 📞 Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/gilbertbouic/Mkweli-Mobile/issues).

---

**Built with ❤️ using React Native**
