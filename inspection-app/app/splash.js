import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={styles.container}
    >
      {/* Background Circle */}
      <View style={styles.backgroundCircle} />

      {/* Small Floating Dots */}
      <View style={styles.dotBlue} />
      <View style={styles.dotGreen} />

      {/* Phone Mockup */}
      <View className="items-center justify-center" style={styles.phoneMockup}>
        {/* Ripple Circles */}
        <View style={styles.ripple1} />
        <View style={styles.ripple2} />
        <View style={styles.ripple3} />

        {/* Logo Circle */}
        <View
          className="items-center justify-center"
          style={styles.logoContainer}
        >
          <View
            className="items-center justify-center"
            style={styles.logoBorder}
          >
            <Ionicons name="clipboard-outline" size={50} color="#fff" />
          </View>
        </View>

        {/* App Name */}
        <Text className="text-white font-bold" style={styles.appName}>
          Reecomm
        </Text>
        <Text className="font-semibold" style={styles.appSubtitle}>
          Inspector
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E9EEF7",
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
    top: 140,
    left: 60,
  },
  dotGreen: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#69A84F",
    bottom: 120,
    right: 50,
  },
  phoneMockup: {
    width: 260,
    height: 520,
    backgroundColor: "#1E56A0",
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  ripple1: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  ripple2: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  ripple3: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logoBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: "#fff",
  },
  appName: {
    fontSize: 32,
    marginTop: 30,
    letterSpacing: 1,
  },
  appSubtitle: {
    color: "#D6E4FF",
    fontSize: 18,
    marginTop: 6,
  },
});
