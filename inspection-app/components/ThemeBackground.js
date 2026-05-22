import React from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ThemeBackground({ children, style, useSafeArea = false }) {
  const content = <View style={[styles.inner, style]}>{children}</View>;

  return (
    <LinearGradient
      colors={["#313131", "#1A1919", "#000000"]}
      locations={[0, 0.45, 1.0]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.gradient}
    >
      {useSafeArea ? (
        <SafeAreaView style={styles.safeContainer}>{content}</SafeAreaView>
      ) : (
        content
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
