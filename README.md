# 🚴 iConsole+ Bluetooth Client

A modern Electron application built with SolidJS for connecting to iConsole+ exercise bikes via Bluetooth and displaying real-time workout data.

![iConsole+ Client Screenshot](screen.png)

## ✨ Features

- 🔗 **Bluetooth LE Connection** - Connect to iConsole+ exercise bikes
- 📊 **Real-time Data** - Live workout metrics display
- 🎯 **FTMS Protocol** - Full FTMS (Fitness Machine Service) support
- 💻 **Cross-platform** - Works on Windows, macOS, and Linux
- 🎨 **Modern UI** - Built with SolidJS and Electron

## 📈 Supported Metrics

- ⏱️ **Workout Time** - Elapsed session time
- 🚴 **Speed** - Current cycling speed (km/h)
- 🔄 **Cadence** - Pedaling RPM
- 📏 **Distance** - Total distance traveled
- 🔥 **Calories** - Calories burned
- 💓 **Heart Rate** - BPM (when sensor connected)
- ⚡ **Power** - Instantaneous power output (watts)
- 🎚️ **Resistance** - Current resistance level

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Bluetooth LE compatible device

### Installation

```bash
# Clone the repository
git clone https://github.com/BostonLeeK/iconsole-plus-client.git
cd iconsole-client

# Install dependencies
npm install

# Start the development server
npm start
```

### Building

```bash
# Build for production
npm run build

# Package for distribution
npm run package
```

## 🔧 Usage

1. **Launch the application**
2. **Enable Bluetooth** on your device
3. **Power on** your iConsole+ exercise bike
4. **Click "Scan"** to discover nearby devices
5. **Select your bike** from the list
6. **Connect** and start your workout!

## 📋 Supported Devices

- iConsole+ exercise bikes (tested with iConsole+0051)
- Any FTMS-compatible fitness equipment

## 🔍 Technical Details

This application uses the standard **FTMS (Fitness Machine Service)** Bluetooth protocol to communicate with exercise bikes. For detailed information about data parsing and protocol implementation, see our comprehensive documentation:

👉 **[FTMS Data Parsing Documentation](./FTMS_PARSING.md)**

### Key Technical Features

- **Service UUID**: `1826` (FTMS)
- **Message Format**: 21-byte Indoor Bike Data packets
- **Update Frequency**: 2-3 seconds
- **Platform**: Electron + SolidJS
- **Bluetooth Library**: @abandonware/noble

## 📁 Project Structure

```
src/
├── main/                 # Electron main process
├── renderer/            # SolidJS renderer
│   ├── components/      # UI components
│   ├── modules/         # Feature modules
│   └── stores/          # State management
├── services/            # Bluetooth & data services
└── types/              # TypeScript definitions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- iConsole+ for creating quality exercise equipment
- The Bluetooth SIG for the FTMS specification
- The open-source community for excellent libraries

## 📞 Support

If you encounter any issues or have questions:

1. Check the [FTMS Parsing Documentation](./FTMS_PARSING.md)
2. Search existing [GitHub Issues](https://github.com/BostonLeeK/iconsole-plus-client/issues)
3. Create a new issue with detailed information

---

**Made with ❤️ for the fitness community**
