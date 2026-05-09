# 📂 Complete Project Structure

```
inspection-app/
│
├── 📱 app/                                    # Expo Router - File-based routing
│   ├── _layout.js                            # Root layout with Stack navigation
│   ├── index.js                              # Landing/Home screen (/)
│   └── (tabs)/                               # Tab navigation group
│       ├── _layout.js                        # Tab bar configuration
│       ├── home.js                           # Dashboard tab
│       ├── inspections.js                    # Inspections list tab
│       └── profile.js                        # User profile tab
│
├── 🎨 components/                             # Reusable UI components
│   └── common/                               # Common/shared components
│       ├── Button.js                         # Custom button with variants
│       ├── Card.js                           # Card container component
│       ├── Input.js                          # Form input with validation
│       ├── LoadingSpinner.js                 # Loading indicator
│       └── index.js                          # Barrel exports
│
├── 🔌 services/                               # Business logic & API integration
│   └── api/                                  # API service layer
│       ├── api.js                            # Base API service (fetch wrapper)
│       ├── authAPI.js                        # Authentication endpoints
│       ├── inspectionAPI.js                  # Inspection CRUD operations
│       └── index.js                          # Barrel exports
│
├── ⚙️ config/                                 # Configuration files
│   ├── api.config.js                         # API URLs, endpoints, timeouts
│   └── app.config.js                         # App settings, colors, constants
│
├── 🛠️ utils/                                  # Utility functions
│   ├── helpers.js                            # General utilities (date, format, etc.)
│   ├── validation.js                         # Form validation functions
│   ├── storage.js                            # AsyncStorage wrapper
│   └── index.js                              # Barrel exports
│
├── 🎣 hooks/                                  # Custom React hooks
│   ├── useApi.js                             # API call hook with loading/error states
│   └── index.js                              # Barrel exports
│
├── 📊 constants/                              # App-wide constants
│   ├── colors.js                             # Color palette definitions
│   └── index.js                              # Barrel exports
│
├── 🖼️ assets/                                 # Static assets
│   ├── icon.png                              # App icon
│   ├── splash-icon.png                       # Splash screen
│   ├── adaptive-icon.png                     # Android adaptive icon
│   └── favicon.png                           # Web favicon
│
├── 📄 Configuration Files
│   ├── app.json                              # Expo configuration
│   ├── package.json                          # Dependencies & scripts
│   ├── babel.config.js                       # Babel config (NativeWind preset)
│   ├── tailwind.config.js                    # Tailwind CSS configuration
│   ├── metro.config.js                       # Metro bundler config
│   ├── global.css                            # Global Tailwind styles
│   ├── .gitignore                            # Git ignore rules
│   ├── .env.example                          # Environment variables template
│   └── index.js                              # Legacy entry point (not used)
│
└── 📚 Documentation
    ├── README.md                             # Main documentation
    ├── QUICKSTART.md                         # Quick start guide
    ├── ARCHITECTURE.md                       # Architecture documentation
    └── PROJECT_STRUCTURE.md                  # This file
```

## 📋 File Count Summary

| Category          | Count | Description                    |
| ----------------- | ----- | ------------------------------ |
| **Screens**       | 4     | Landing + 3 tab screens        |
| **Components**    | 4     | Reusable UI components         |
| **API Services**  | 3     | Base + Auth + Inspections      |
| **Utils**         | 3     | Helpers + Validation + Storage |
| **Config**        | 2     | API + App configuration        |
| **Hooks**         | 1     | Custom React hooks             |
| **Constants**     | 1     | Color definitions              |
| **Config Files**  | 7     | Babel, Tailwind, Metro, etc.   |
| **Documentation** | 4     | README, guides, architecture   |

## 🎯 Key Features by Folder

### 📱 app/

- ✅ File-based routing with Expo Router
- ✅ Tab navigation (Home, Inspections, Profile)
- ✅ Stack navigation for modals/details
- ✅ Automatic deep linking

### 🎨 components/

- ✅ Button with variants (primary, secondary, success, danger)
- ✅ Card container for content
- ✅ Input with validation and error display
- ✅ Loading spinner with custom message

### 🔌 services/

- ✅ Centralized API client
- ✅ Automatic token injection
- ✅ Error handling
- ✅ Request timeout
- ✅ Mock data for development

### 🛠️ utils/

- ✅ Date formatting
- ✅ Debounce & throttle
- ✅ Form validation (email, password, phone)
- ✅ AsyncStorage wrapper
- ✅ Helper functions (capitalize, truncate, etc.)

### 🎣 hooks/

- ✅ useApi - API calls with loading/error states
- ✅ Automatic data fetching
- ✅ Manual refetch capability

## 🔄 Data Flow

```
User Interaction
      ↓
Screen Component (app/)
      ↓
API Service (services/api/)
      ↓
Base API Service (api.js)
      ↓
HTTP Request (fetch)
      ↓
Backend API
      ↓
Response flows back up
      ↓
State Update
      ↓
UI Re-render
```

## 🎨 Styling System

- **Framework:** NativeWind v4 (Tailwind CSS for React Native)
- **Configuration:** `tailwind.config.js`
- **Global Styles:** `global.css`
- **Metro Integration:** `metro.config.js`
- **Babel Plugin:** `babel.config.js`

## 📦 Dependencies

### Core

- `expo` - React Native framework
- `react` - UI library
- `react-native` - Native components

### Navigation

- `expo-router` - File-based routing
- `react-native-screens` - Native navigation
- `react-native-safe-area-context` - Safe area handling

### Styling

- `nativewind` - Tailwind CSS for RN
- `tailwindcss` - CSS framework

### Storage

- `@react-native-async-storage/async-storage` - Local storage

### UI

- `@expo/vector-icons` - Icon library
- `react-native-reanimated` - Animations

## 🚀 Getting Started

1. **Install:** `npm install`
2. **Start:** `npx expo start -c`
3. **Run:** Press `i` (iOS) or `a` (Android)

## 📝 Naming Conventions

| Type       | Convention           | Example         |
| ---------- | -------------------- | --------------- |
| Components | PascalCase           | `Button.js`     |
| Screens    | camelCase            | `home.js`       |
| Utils      | camelCase            | `helpers.js`    |
| Constants  | UPPER_CASE           | `COLORS`        |
| Hooks      | camelCase with 'use' | `useApi.js`     |
| Config     | camelCase            | `api.config.js` |

## 🎯 Next Steps

1. ✅ Basic structure created
2. ⏳ Connect to real API
3. ⏳ Add authentication flow
4. ⏳ Implement inspection forms
5. ⏳ Add image upload
6. ⏳ Offline support
7. ⏳ Push notifications

## 📚 Documentation Files

- **README.md** - Complete project overview and setup
- **QUICKSTART.md** - Get started in 5 minutes
- **ARCHITECTURE.md** - Detailed architecture explanation
- **PROJECT_STRUCTURE.md** - This file (folder structure)

---

**Last Updated:** May 9, 2026
**Version:** 1.0.0
**Team:** Quba Infotech
