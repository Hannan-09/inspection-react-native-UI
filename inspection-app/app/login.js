import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import messaging from "@react-native-firebase/messaging";
import { authAPI } from "../services/api/authAPI";
import { COLORS } from "../constants";
import ThemeBackground from "../components/ThemeBackground";
import { getDeviceInformation } from "../utils/deviceInfo";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const showError = (message) => {
    Toast.show({
      type: "error",
      text1: "Login Failed",
      text2: message,
      position: "top",
      visibilityTime: 4000,
    });
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    // Basic validation
    if (!username.trim()) {
      showError("Please enter your username.");
      return;
    }
    if (!password) {
      showError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await authAPI.login(username.trim(), password);

      const deviceInfo = await getDeviceInformation();
      console.log("========== DEVICE INFO ==========");
      console.table(deviceInfo);
      console.log("================================");

      try {
        // Request permissions for iOS
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          // Get the device token
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            await authAPI.sendFCMToken(fcmToken);
            console.log("FCM token sent successfully:", fcmToken);
          }
        } else {
          console.log("User declined messaging permissions");
        }
      } catch (fcmErr) {
        console.error("Failed to fetch or send FCM token", fcmErr);
      }

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
        position: "top",
        visibilityTime: 1500,
      });
      // Short delay so the toast is visible before navigating
      setTimeout(() => router.replace("/home"), 1200);
    } catch (err) {
      const msg =
        err?.message ||
        "Login failed. Please check your credentials and try again.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeBackground style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Login Card */}
            <View style={styles.loginCard}>
              {/* Logo */}
              <View className="items-center mb-8">
                <View
                  className="items-center justify-center"
                  style={styles.logoBorder}
                >
                  <Ionicons name="clipboard-outline" size={50} color={COLORS.fourth} />
                </View>
                <Text className="font-semibold" style={styles.welcomeText}>
                  Reecomm Inspector
                </Text>
              </View>

              {/* Title */}
              <View className="flex-row mb-9 justify-center items-center">
                <Text
                  className="font-bold"
                  style={[styles.tabText, styles.tabTextActive, styles.tabButton]}
                >
                  Login
                </Text>
                <View style={styles.tabIndicator} />
              </View>

              {/* Username Input */}
              <View className="mb-4" style={styles.inputContainer}>
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={username}
                  onChangeText={(t) => { setUsername(t); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  style={styles.input}
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View
                className="flex-row items-center mb-5"
                style={styles.inputContainer}
              >
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => { setPassword(t); }}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  style={styles.passwordInput}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={COLORS.third}
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                className="items-center justify-center mb-4"
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    className="text-white font-bold"
                    style={styles.loginButtonText}
                  >
                    LOGIN
                  </Text>
                )}
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity
                className="mb-6"
                onPress={() => Alert.alert("Forgot Password", "Please contact your administrator to reset your password.")}
                disabled={loading}
              >
                <Text className="font-medium" style={styles.forgotText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loginCard: {
    width: "88%",
    borderRadius: 40,
    paddingHorizontal: 28,
    paddingVertical: 40,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  logoBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: COLORS.fourth,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 30,
    color: COLORS.secondary,
    marginTop: 25,
  },
  tabButton: {
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.third,
  },
  tabTextActive: {
    color: COLORS.fourth,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.fourth,
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  input: {
    height: 55,
    fontSize: 16,
    color: COLORS.secondary,
  },
  passwordInput: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: COLORS.secondary,
  },
  loginButton: {
    backgroundColor: COLORS.fourth,
    height: 55,
    borderRadius: 12,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  forgotText: {
    color: COLORS.fourth,
    textAlign: "center",
  },
});
