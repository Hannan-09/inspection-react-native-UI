import React from "react";
import { View, Text, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../../constants";

export default function UploadProgressModal({ visible, current, total }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.fourth} style={{ marginBottom: 16 }} />
          <Text style={styles.title}>Uploading Images</Text>
          <Text style={styles.subtitle}>
            Please wait while we upload your images to secure storage...
          </Text>
          {total > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, Math.round((current / total) * 100))}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {current} of {total} uploaded ({Math.round((current / total) * 100)}%)
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.fourth,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#D1D5DB",
    fontWeight: "500",
  },
});
