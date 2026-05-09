# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies

```bash
cd inspection-app
npm install
```

### Step 2: Start Development Server

```bash
npx expo start -c
```

The `-c` flag clears the cache (important for NativeWind to work).

### Step 3: Run on Device/Emulator

**Option A: Physical Device**

1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. App will load on your device

**Option B: iOS Simulator (Mac only)**

- Press `i` in the terminal
- Simulator will open automatically

**Option C: Android Emulator**

- Start Android emulator first
- Press `a` in the terminal

## 📱 Testing the App

Once running, you should see:

1. **Landing Screen** - "Inspection App" with "Get Started" button
2. **Tab Navigation** - Home, Inspections, Profile tabs
3. **Styled Components** - Tailwind CSS classes applied

## 🎨 Verify Tailwind CSS is Working

Check if you see:

- ✅ White background
- ✅ Colored buttons (blue)
- ✅ Proper spacing and padding
- ✅ Rounded corners on cards

If styles are NOT working:

```bash
# Clear cache and restart
rm -rf node_modules/.cache
npx expo start -c
```

## 🔧 Common Issues

### Issue: "Metro bundler error"

**Solution:**

```bash
npx expo start -c --clear
```

### Issue: "Styles not applying"

**Solution:**

1. Check `metro.config.js` exists
2. Check `babel.config.js` has `nativewind/babel` preset
3. Restart with cache clear: `npx expo start -c`

### Issue: "Cannot find module 'expo-router'"

**Solution:**

```bash
npx expo install expo-router
```

## 📝 Next Steps

### 1. Configure API Endpoint

Edit `config/api.config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: "https://your-api-url.com/v1",
};
```

### 2. Add Environment Variables

Create `.env` file:

```
EXPO_PUBLIC_API_URL=https://your-api-url.com/v1
```

### 3. Customize Colors

Edit `tailwind.config.js` or `constants/colors.js`

### 4. Add New Screens

Create new file in `app/` directory:

```javascript
// app/settings.js
export default function Settings() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Settings Screen</Text>
    </View>
  );
}
```

### 5. Create Custom Components

Add to `components/common/`:

```javascript
// components/common/Badge.js
export function Badge({ text, color = "blue" }) {
  return (
    <View className={`bg-${color}-100 px-3 py-1 rounded-full`}>
      <Text className={`text-${color}-700 text-xs font-semibold`}>{text}</Text>
    </View>
  );
}
```

## 🎯 Development Workflow

1. **Make changes** to files
2. **Save** - Metro will auto-reload
3. **Test** on device/emulator
4. **Repeat**

### Hot Reload

- Saves automatically reload the app
- Shake device to open developer menu
- Press `r` in terminal to reload manually

## 📚 Learn More

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## 🆘 Need Help?

Check these files for documentation:

- `README.md` - Full project documentation
- `ARCHITECTURE.md` - Architecture details
- `app/` - See example screens

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Dev server running
- [ ] App loads on device/emulator
- [ ] Tailwind styles working
- [ ] Navigation working (tabs)
- [ ] API endpoint configured

You're all set! Happy coding! 🎉
