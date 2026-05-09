# Architecture Documentation

## 🏗️ Application Architecture

### Overview

This is a React Native mobile application built with Expo, using modern best practices and a clean architecture pattern.

## 📐 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (app/ - Screens & Navigation, components/ - UI)        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
│         (services/ - API calls & data handling)         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│    (utils/storage.js - Local persistence, API calls)    │
└─────────────────────────────────────────────────────────┘
```

## 🗂️ Detailed Folder Structure

### 1. **app/** - Expo Router (File-based Routing)

The `app` directory uses Expo Router's file-based routing system.

```
app/
├── _layout.js              # Root layout (wraps entire app)
├── index.js                # Landing/Home screen (/)
└── (tabs)/                 # Tab navigation group
    ├── _layout.js          # Tab bar configuration
    ├── home.js             # Dashboard (/home)
    ├── inspections.js      # Inspections list (/inspections)
    └── profile.js          # User profile (/profile)
```

**Key Concepts:**

- Files automatically become routes
- `_layout.js` defines navigation structure
- `(tabs)` is a route group (parentheses hide from URL)
- `index.js` is the default route

### 2. **components/** - Reusable UI Components

```
components/
└── common/
    ├── Button.js           # Customizable button with variants
    ├── Card.js             # Container component
    ├── Input.js            # Form input with validation
    ├── LoadingSpinner.js   # Loading indicator
    └── index.js            # Barrel export
```

**Design Principles:**

- Small, focused components
- Prop-based customization
- Styled with Tailwind (NativeWind)
- Reusable across screens

### 3. **services/** - Business Logic & API

```
services/
└── api/
    ├── api.js              # Base API service (fetch wrapper)
    ├── authAPI.js          # Authentication endpoints
    ├── inspectionAPI.js    # Inspection CRUD operations
    └── index.js            # Barrel export
```

**API Service Features:**

- Centralized HTTP client
- Automatic token injection
- Error handling
- Request/response interceptors
- Timeout management

**Example Flow:**

```
Screen → inspectionAPI.getAll() → apiService.get() → fetch() → API
```

### 4. **config/** - Configuration Files

```
config/
├── api.config.js           # API URLs, endpoints, timeouts
└── app.config.js           # App settings, colors, constants
```

**Purpose:**

- Centralize configuration
- Environment-specific settings
- Easy to modify without touching code

### 5. **utils/** - Utility Functions

```
utils/
├── helpers.js              # General utilities (date, format, etc.)
├── validation.js           # Form validation functions
├── storage.js              # AsyncStorage wrapper
└── index.js                # Barrel export
```

**Categories:**

- **helpers.js**: Date formatting, debounce, throttle, etc.
- **validation.js**: Email, password, phone validation
- **storage.js**: Local data persistence wrapper

### 6. **constants/** - App Constants

```
constants/
├── colors.js               # Color palette
└── index.js                # Barrel export
```

**Usage:**

```javascript
import { COLORS } from "../constants";
// Use: COLORS.primary, COLORS.success, etc.
```

## 🔄 Data Flow

### Example: Fetching Inspections

```
1. User opens Inspections tab
   ↓
2. inspections.js calls inspectionAPI.getAll()
   ↓
3. inspectionAPI.getAll() calls apiService.get('/inspections')
   ↓
4. apiService adds auth token and makes fetch request
   ↓
5. Response returns through the chain
   ↓
6. Component updates state and re-renders
```

### Code Example:

```javascript
// Screen (app/(tabs)/inspections.js)
const loadInspections = async () => {
  const data = await inspectionAPI.getAll();
  setInspections(data);
};

// API Service (services/api/inspectionAPI.js)
async getAll() {
  return await apiService.get('/inspections');
}

// Base Service (services/api/api.js)
async get(endpoint) {
  return this.request(endpoint, { method: 'GET' });
}
```

## 🎨 Styling Architecture

### NativeWind (Tailwind CSS)

- Utility-first CSS framework
- Configured in `tailwind.config.js`
- Processed by Metro bundler via `metro.config.js`
- Global styles in `global.css`

### Usage:

```jsx
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-800">Title</Text>
</View>
```

## 🔐 Authentication Flow

```
1. User enters credentials
   ↓
2. authAPI.login(email, password)
   ↓
3. API returns token
   ↓
4. Token saved via apiService.setAuthToken()
   ↓
5. Token automatically added to all future requests
   ↓
6. Navigate to main app
```

## 📱 Navigation Structure

```
Root (_layout.js)
├── index.js (Landing)
└── (tabs) (_layout.js)
    ├── home.js
    ├── inspections.js
    └── profile.js
```

**Navigation Methods:**

```javascript
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/inspections"); // Navigate
router.back(); // Go back
```

## 🧪 Testing Strategy (Future)

```
├── __tests__/
│   ├── components/         # Component tests
│   ├── services/           # API service tests
│   └── utils/              # Utility function tests
```

## 📦 State Management

**Current:** React useState/useEffect
**Future Options:**

- Context API for global state
- Zustand for simple state management
- Redux Toolkit for complex apps

## 🚀 Build & Deploy

### Development

```bash
npx expo start -c
```

### Production Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🔧 Configuration Files

| File                 | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `babel.config.js`    | Babel transpiler config (includes NativeWind) |
| `tailwind.config.js` | Tailwind CSS configuration                    |
| `metro.config.js`    | Metro bundler config (NativeWind integration) |
| `app.json`           | Expo app configuration                        |
| `package.json`       | Dependencies and scripts                      |

## 📝 Coding Standards

### File Naming

- Components: PascalCase (`Button.js`)
- Utilities: camelCase (`helpers.js`)
- Screens: camelCase (`home.js`)
- Constants: UPPER_CASE in file

### Import Order

1. React/React Native
2. Third-party libraries
3. Local components
4. Services/Utils
5. Constants/Config
6. Styles

### Component Structure

```javascript
// 1. Imports
import { View, Text } from "react-native";
import { Button } from "../../components/common";

// 2. Component
export default function MyScreen() {
  // 3. State
  const [data, setData] = useState([]);

  // 4. Effects
  useEffect(() => {
    loadData();
  }, []);

  // 5. Functions
  const loadData = async () => {
    // ...
  };

  // 6. Render
  return <View>{/* JSX */}</View>;
}
```

## 🎯 Best Practices

1. **Keep components small** - Single responsibility
2. **Use common components** - Don't repeat UI code
3. **Centralize API calls** - All in services/api/
4. **Validate user input** - Use validation utilities
5. **Handle errors gracefully** - Try/catch + user feedback
6. **Use TypeScript** (future) - Type safety
7. **Write tests** (future) - Ensure reliability

## 🔄 Future Enhancements

- [ ] TypeScript migration
- [ ] Unit & integration tests
- [ ] E2E testing with Detox
- [ ] State management (Context/Zustand)
- [ ] Offline support
- [ ] Push notifications
- [ ] Analytics integration
- [ ] Error tracking (Sentry)
- [ ] CI/CD pipeline
