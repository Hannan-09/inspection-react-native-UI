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
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    router.replace("/home");
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
          {/* Background Circle */}
          {/* <View style={styles.backgroundCircle} /> */}

          {/* Login Card */}
          <View className="bg-white" style={styles.loginCard}>
            {/* Logo */}
            <View className="items-center mb-8">
              <View
                className="items-center justify-center"
                style={styles.logoBorder}
              >
                <Ionicons name="clipboard-outline" size={50} color="#1E56A0" />
              </View>
              <Text className="font-semibold" style={styles.welcomeText}>
                Reecomm Inspector
              </Text>
            </View>

            {/* Tabs */}
            <View className="flex-row mb-9 justify-center items-center">
                <Text
                  className="font-bold"
                  style={[
                    styles.tabText,
                    styles.tabTextActive,
                    styles.tabButton
                  ]}
                >
                  Login
                </Text>
                <View style={styles.tabIndicator} />
            </View>

            {/* Email Input */}
            <View className="mb-4" style={styles.inputContainer}>
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                style={styles.input}
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
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={styles.passwordInput}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              className="items-center justify-center mb-4"
              style={styles.loginButton}
            >
              <Text
                className="text-white font-bold"
                style={styles.loginButtonText}
              >
                LOGIN
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6">
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
    backgroundColor: "#E9EEF7",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  backgroundCircle: {
    position: "absolute",
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: "#DCE5F3",
    opacity: 0.6,
  },
  dotBlue: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1E56A0",
    top: 120,
    left: 40,
  },
  dotGreen: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#69A84F",
    bottom: 100,
    right: 40,
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
  },
  logoBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: "#1E56A0",
  },
  welcomeText: {
    fontSize: 30,
    color: "#111",
    marginTop: 25,
  },
  tabButton: {
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  tabTextActive: {
    color: "#1E56A0",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#1E56A0",
  },
  inputContainer: {
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  input: {
    height: 55,
    fontSize: 16,
    color: "#111",
  },
  passwordInput: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: "#111",
  },
  loginButton: {
    backgroundColor: "#1E56A0",
    height: 55,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    letterSpacing: 1,
  },
  forgotText: {
    color: "#1E56A0",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    color: "#999",
  },
  googleButton: {
    backgroundColor: "#4285F4",
    height: 52,
    borderRadius: 10,
  },
  linkedinButton: {
    backgroundColor: "#0077B5",
    height: 52,
    borderRadius: 10,
  },
});
