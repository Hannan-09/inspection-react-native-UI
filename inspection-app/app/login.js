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
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { authAPI } from "../services/api/authAPI";
import { COLORS } from "../constants";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={styles.container}
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
          <View className="bg-white" style={styles.loginCard}>
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
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
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
                <ActivityIndicator color={COLORS.primary} size="small" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.gray100,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: COLORS.primary,
  },
  logoBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: COLORS.fourth,
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
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
    color: COLORS.primary,
    letterSpacing: 1,
  },
  forgotText: {
    color: COLORS.fourth,
    textAlign: "center",
  },
});
