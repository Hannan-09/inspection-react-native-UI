import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { apiService } from "../services/api/api";
import { COLORS } from "../constants";
import ThemeBackground from "../components/ThemeBackground";

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Kick off animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auth check after 2.5s so the animation plays fully
    const timer = setTimeout(async () => {
      try {
        const isLoggedIn = await apiService.isAuthenticated();
        if (isLoggedIn) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeBackground style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          alignItems: "center",
        }}
      >
        <Text style={styles.title}>Reecomm</Text>
        <Text style={styles.subtitle}>Inspector</Text>
      </Animated.View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: COLORS.secondary,
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.fourth,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
});