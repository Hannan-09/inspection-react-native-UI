# Reecomm Inspection App

A React Native + Expo application for managing inspections, built with Expo Router and NativeWind (Tailwind CSS).

## 📁 Folder Structure

```
inspection-app/
├── app/                          # Expo Router app directory (file-based routing)
│   ├── _layout.js               # Root layout with navigation setup
│   ├── index.js                 # Home/Landing screen
│   └── (tabs)/                  # Tab navigation group
│       ├── _layout.js           # Tab layout configuration
│       ├── home.js              # Dashboard/Home tab
│       ├── inspections.js       # Inspections list tab
│       └── profile.js           # User profile tab
│
├── components/                   # Reusable UI components
│   └── common/                  # Common/shared components
│       ├── Button.js            # Custom button component
│       ├── Card.js              # Card container component
│       ├── Input.js             # Form input component
│       ├── LoadingSpinner.js    # Loading indicator
│       └── index.js             # Component exports
│
├── services/                     # Business logic and API services
│   └── api/                     # API integration
│       ├── api.js               # Base API service with fetch wrapper
│       ├── authAPI.js           # Authentication endpoints
│       ├── inspectionAPI.js     # Inspection CRUD operations
│       └── index.js             # API exports
│
├── config/                       # Configuration files
│   ├── api.config.js            # API endpoints and settings
│   └── app.config.js            # App-wide configuration
│
├── utils/                        # Utility functions
│   ├── helpers.js               # General helper functions
│   ├── validation.js            # Form validation utilities
│   ├── storage.js               # AsyncStorage wrapper
│   └── index.js                 # Utils exports
│
├── constants/                    # App constants
│   ├── colors.js                # Color palette
│   └── index.js                 # Constants exports
│
├── assets/                       # Static assets (images, fonts, etc.)
│   ├── icon.png
│   ├── splash-icon.png
│   └── ...
│
├── babel.config.js              # Babel configuration (NativeWind preset)
├── tailwind.config.js           # Tailwind CSS configuration
├── metro.config.js              # Metro bundler configuration
├── global.css                   # Global Tailwind styles
├── app.json                     # Expo configuration
└── package.json                 # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npx expo start -c
```

3. Run on your platform:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 🎨 Styling

This project uses **NativeWind v4** (Tailwind CSS for React Native).

### Usage Example:

```jsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-gray-800">Hello World</Text>
</View>
```

## 📱 Navigation

Built with **Expo Router** (file-based routing):

- `app/index.js` - Landing page
- `app/(tabs)/` - Tab navigation screens
- Automatic deep linking support

## 🔌 API Integration

### Configuration

Update API base URL in `config/api.config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: "https://your-api.com/v1",
  TIMEOUT: 30000,
};
```

### Usage Example:

```javascript
import { inspectionAPI } from "./services/api";

// Fetch inspections
const inspections = await inspectionAPI.getAll();

// Create inspection
const newInspection = await inspectionAPI.create(data);
```

## 📦 Key Dependencies

- **expo** - React Native framework
- **expo-router** - File-based routing
- **nativewind** - Tailwind CSS for React Native
- **react-native-reanimated** - Animations
- **@react-native-async-storage/async-storage** - Local storage
- **@expo/vector-icons** - Icon library

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

### Adding New Screens

1. Create a new file in `app/` directory
2. Export a React component
3. Navigation is automatic based on file name

Example: `app/settings.js` → accessible at `/settings`

## 📝 Code Structure Guidelines

### Components

- Keep components small and focused
- Use common components from `components/common/`
- Export from index files for clean imports

### API Services

- All API calls go through `services/api/`
- Use the base `apiService` for common functionality
- Create specific API files for different resources

### Utilities

- Pure functions only
- No side effects
- Well-documented and tested

## 🎯 Features

- ✅ File-based routing with Expo Router
- ✅ Tab navigation
- ✅ Tailwind CSS styling with NativeWind
- ✅ API service layer with error handling
- ✅ Form validation utilities
- ✅ Local storage wrapper
- ✅ Reusable UI components
- ✅ Mock data for development

## 🔐 Environment Variables

Create a `.env` file in the root:

```
EXPO_PUBLIC_API_URL=https://your-api.com/v1
```

Access in code:

```javascript
process.env.EXPO_PUBLIC_API_URL;
```

## 📄 License

Private - Reecomm Inspection App

## 👥 Team

Quba Infotech - Development Team
