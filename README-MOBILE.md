# iConsole+ Mobile Client

📱 **Mobile app for tracking and monitoring iConsole+ exercise bike workouts**

## 🚀 Overview

iConsole+ Mobile is a React Native app built with Expo that allows remote monitoring of workout metrics from the iConsole+ desktop application. The mobile client connects to the main app via WebSocket connection and provides a convenient interface for real-time workout monitoring.

## ✨ Key Features

### 📊 Workout Monitoring

- **Speed** - Current speed in km/h with large central display
- **Target Speed** - AI trainer target speed (displayed under current speed)
- **Workout Time** - Total session duration
- **Distance** - Distance covered in km
- **Heart Rate** - Heart rate in BPM
- **Resistance** - Current resistance level (R1-R32) with color coding
- **Power** - Current power output in watts
- **Cadence (RPM)** - Pedal revolutions per minute
- **Calories** - Calories burned
- **Pace** - Pace per km

### 🤖 AI Trainer

- Real-time AI recommendations
- Resistance change display (old → new)
- Target speed visualization
- Auto-dismiss notifications after 3 seconds

### 🎨 Interface

- **Dark theme** with modern design
- **Central speed circle** with status highlighting
- **Corner metrics** in convenient layout
- **Color-coded resistance**:
  - 🟢 R1-R5: Green (easy)
  - 🟠 R6-R10: Orange (medium)
  - 🟠 R11-R15: Orange (hard)
  - 🔴 R16-R20: Red (extreme)

## 🛠 Technology Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **WebSocket** for real-time communication
- **AsyncStorage** for settings persistence
- **React Native Paper** UI components

## 📱 Installation & Setup

### Prerequisites

- Node.js (version 16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Mobile device with Android/iOS or emulator

### Installation Steps

1. **Clone the repository:**

```bash
git clone <repository-url>
cd iconsole-client/iconsole-mobile
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start in development mode:**

```bash
npx expo start
```

4. **Install Expo Go on your mobile device:**

   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

5. **Scan QR code** using Expo Go

## ⚙️ Configuration

### Connecting to Main App

1. **Launch the main iConsole+ app** on your computer
2. **Enable WebSocket server** in settings
3. **Open mobile app** and tap ⚙️ (Settings)
4. **Enter connection details:**
   - **Server Host**: Computer IP address (e.g., 192.168.1.100)
   - **Server Port**: WebSocket port (default 8080)
   - **API Key**: Access key from main app
   - **Auto Connect**: Automatic connection on startup

### Getting Computer IP Address

**Windows:**

```cmd
ipconfig
```

**macOS/Linux:**

```bash
ifconfig
```

**Alternative:** In the main app, go to WebSocket settings - IP and port will be displayed there.

## 🔌 Connection

1. **Tap "📡 CONNECT" button** on main screen
2. **Connection status** displayed at the top:
   - 🟢 "Connected" - connected
   - 🔴 "Disconnected" - disconnected
   - 🟡 "Connecting..." - connecting
3. **Session indicator** - green circle around speed when workout is active

## 📋 Production Build

### Android APK

```bash
# Login to Expo account
npx expo login

# Build APK
npx expo build:android --type=apk
```

### Android AAB (for Google Play)

```bash
npx expo build:android --type=app-bundle
```

### iOS

```bash
npx expo build:ios
```

### Alternative with EAS Build

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure project
npx eas build:configure

# Build for Android
npx eas build --platform android

# Build for iOS
npx eas build --platform ios
```

## 🔧 Configuration Files

### `app.json`

Main Expo app configuration with build settings and metadata.

### `eas.json`

EAS Build configuration with build profiles:

- **development**: for development
- **preview**: for testing
- **production**: for release (APK instead of AAB)

## 🌐 WebSocket API

The mobile app receives the following message types:

### Workout Data (`workout-data`)

```json
{
  "type": "workout-data",
  "data": {
    "time": 120,
    "speed": 25.5,
    "watt": 180,
    "heartRate": 145,
    "calories": 45,
    "distance": 1.2,
    "rpm": 65,
    "resistance": 8
  }
}
```

### AI Recommendations (`ai-advice`)

```json
{
  "type": "ai-advice",
  "data": {
    "advice": "Increase resistance for more intensive training",
    "action": "Keep the pace!",
    "oldResistance": 8,
    "newResistance": 10,
    "targetSpeed": 28,
    "rideStyle": "HIIT",
    "goal": "weight_loss"
  }
}
```

### Session Status

- `session-started` - workout started
- `session-stopped` - workout ended

## 🎯 Usage Features

### Metrics Display

- **Central circle**: Current speed with AI target speed
- **Corner metrics**: Time, heart rate, distance, resistance
- **Bottom metrics**: Power, RPM, calories, pace

### AI Recommendations

- Appear automatically when received from main app
- Show trainer advice and resistance changes
- Auto-dismiss after 3 seconds
- Can be manually closed by tapping

### Settings Persistence

All settings are saved locally on device and restored on restart.

## 🚨 Troubleshooting

### Connection Issues

1. Ensure main app is running
2. Check that WebSocket server is enabled
3. Ensure devices are on same network
4. Verify correct IP address and port
5. Ensure API key is correct

### Build Issues

1. Clear cache: `npx expo start --clear`
2. Delete node_modules: `rm -rf node_modules && npm install`
3. Check Node.js and Expo CLI versions

## 📞 Support

If you encounter issues or have questions:

1. Check logs in Expo Dev Tools
2. Ensure main app is working
3. Check network and firewall settings

## 🔄 Versions

Check version compatibility:

- **Mobile app**: version from package.json
- **Main app**: version from main window
- **WebSocket API**: protocol version

---

**Built with ❤️ for iConsole+ ecosystem**
