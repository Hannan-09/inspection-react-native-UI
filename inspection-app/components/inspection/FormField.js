import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { COLORS } from "../../constants";

// Helper to return condition colors dynamically based on enum value
export const getConditionColor = (option) => {
  if (!option) return COLORS.fourth;
  const opt = option.trim().toUpperCase().replace(/\s+/g, "_");
  
  if (["GOOD", "WORKING", "NONE", "LOW", "PASS"].includes(opt)) {
    return COLORS.conditionGood;
  }
  if (["FAIR", "PARTIALLY_WORKING", "MINOR", "MODERATE", "MEDIUM", "WORN", "ADVISORY"].includes(opt)) {
    return COLORS.conditionFair;
  }
  if (["POOR", "NOT_WORKING", "MAJOR", "HIGH", "FAIL", "REPLACE", "MISSING"].includes(opt)) {
    return COLORS.conditionPoor;
  }
  if (["NA", "N/A"].includes(opt)) {
    return COLORS.conditionNeutral;
  }
  return COLORS.fourth; // Default to theme blue
};

// ── Tap Buttons (Pass / Fail / N/A) ─────────────────────────────────────────

export const TapButtons = ({ value, onChange, label, required, options = ["Pass", "Fail", "N/A"] }) => {
  const isLarge = options.length > 3;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.buttonRow, { flexWrap: "wrap" }]}>
        {options.map((option) => {
          const isSelected = value === option;
          const activeColor = getConditionColor(option);
          const activeBg = activeColor + "12"; // ~7% opacity tint for background

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.tapButton,
                isLarge ? { minWidth: "45%", flexGrow: 1 } : { flex: 1 },
                isSelected && { borderColor: activeColor, backgroundColor: activeBg },
              ]}
              onPress={() => {
                if (value === option) {
                  onChange(null);
                } else {
                  onChange(option);
                }
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tapButtonText,
                  isSelected && { color: activeColor },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Condition Buttons (None / Minor / Major) ─────────────────────────────────

export const ConditionButtons = ({ value, onChange, label, required, options }) => {
  const opts = options || ["None", "Minor", "Major"];

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.buttonRow}>
        {opts.map((option) => {
          const isSelected = value === option;
          const activeColor = getConditionColor(option);
          const activeBg = activeColor + "12";

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.conditionButton,
                isSelected && { borderColor: activeColor, backgroundColor: activeBg },
              ]}
              onPress={() => {
                if (value === option) {
                  onChange(null);
                } else {
                  onChange(option);
                }
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.conditionButtonText,
                  isSelected && { color: activeColor },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Slider Input (percentage) ─────────────────────────────────────────────────

export const SliderInput = ({
  value,
  onChange,
  label,
  required,
  unit = "%",
}) => {
  const [inputValue, setInputValue] = useState(value?.toString() || "");

  const handleChange = (text) => {
    setInputValue(text);
    const numValue = parseInt(text) || 0;
    onChange(Math.min(100, Math.max(0, numValue)));
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.sliderContainer}>
        <TextInput
          style={styles.sliderInput}
          value={inputValue}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          maxLength={3}
        />
        <Text style={styles.sliderUnit}>{unit}</Text>
      </View>
      <View style={styles.sliderBar}>
        <View style={[styles.sliderFill, { width: `${value || 0}%` }]} />
      </View>
    </View>
  );
};

// ── Number Input ─────────────────────────────────────────────────────────────

export const NumberInput = ({
  value,
  onChange,
  label,
  required,
  unit = "",
  isReadOnly,
}) => {
  const [localText, setLocalText] = useState(value !== undefined && value !== null ? value.toString() : "");

  // Sync from prop changes (e.g. initial load)
  useEffect(() => {
    const propStr = value !== undefined && value !== null ? value.toString() : "";
    const propNum = parseFloat(propStr);
    const localNum = parseFloat(localText);
    if ((isNaN(propNum) && localText !== "") || propNum !== localNum) {
      setLocalText(propStr);
    }
  }, [value]);

  const handleChangeText = (text) => {
    setLocalText(text);
    if (text === "") {
      onChange(null);
    } else {
      const num = parseFloat(text);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.numberInputContainer, isReadOnly && { backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }]}>
        <TextInput
          style={[styles.numberInput, isReadOnly && { color: "#9CA3AF" }]}
          value={localText}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder="Enter value"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          editable={!isReadOnly}
        />
        {unit ? <Text style={styles.inputUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
};

// ── Text Area ─────────────────────────────────────────────────────────────────

export const TextArea = ({
  value,
  onChange,
  label,
  required,
  placeholder = "",
  isReadOnly,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.textArea, isReadOnly && { backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)", color: "#9CA3AF" }]}
        value={value || ""}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!isReadOnly}
      />
    </View>
  );
};

// ── Mini Toggle (Boolean) ─────────────────────────────────────────────────────

export const MiniToggle = ({ value, onChange, label, required }) => {
  return (
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.toggle, value && styles.toggleActive]}
        onPress={() => onChange(!value)}
        activeOpacity={0.7}
      >
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </TouchableOpacity>
    </View>
  );
};

// ── Media Upload (Photo / Video) ──────────────────────────────────────────────

export const ReadOnlyVideoPlayer = ({ uri }) => {
  const player = useVideoPlayer(uri, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = false;
    playerInstance.play();
  });

  return (
    <View style={styles.videoPlayerContainer}>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={true}
      />
    </View>
  );
};

// ── Media Upload (Photo / Video) ──────────────────────────────────────────────

export const MediaUpload = ({
  value,
  onChange,
  label,
  required,
  type = "photo",
  maxCount,
  isReadOnly,
}) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const uris = value
    ? Array.isArray(value) ? value : [value]
    : [];

  const limit = maxCount || (type === "video" ? 1 : 99);

  const takeFromCamera = async () => {
    if (uris.length >= limit) {
      Alert.alert("Limit Reached", `You can only upload up to ${limit} ${type}(s).`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access in Settings.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: type === "video" ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      let merged = [...uris, result.assets[0].uri];
      if (merged.length > limit) merged = merged.slice(0, limit);
      onChange(merged.length === 1 ? merged[0] : merged);
    }
  };

  const removeMedia = (index) => {
    const updated = uris.filter((_, i) => i !== index);
    onChange(updated.length === 0 ? null : updated.length === 1 ? updated[0] : updated);
  };

  const isVideo = type === "video";

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Uploaded previews / video player */}
      {uris.length > 0 && (
        isVideo ? (
          <View style={styles.videoPreviewCard}>
            <View style={styles.videoIconContainer}>
              <Ionicons name="videocam" size={24} color={COLORS.fourth} />
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={1}>
                {label || "Recorded Video"}
              </Text>
              <Text style={styles.videoSubtitle}>
                {uris[0].startsWith("http") ? "Cloud Video" : "Local Recording"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => setIsPlayerOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.playButtonText}>Preview</Text>
            </TouchableOpacity>
            {!isReadOnly && (
              <TouchableOpacity
                style={styles.videoRemoveBtn}
                onPress={() => removeMedia(0)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView horizontal={!isReadOnly} showsHorizontalScrollIndicator={false} style={styles.previewRow}>
            {uris.map((uri, index) => (
              <View key={index} style={[styles.previewContainer, isReadOnly && styles.previewContainerReadOnly]}>
                <Image source={{ uri }} style={[styles.previewImage, isReadOnly && styles.previewImageReadOnly]} />
                {!isReadOnly && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeMedia(index)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )
      )}

      {/* Upload button */}
      {!isReadOnly && uris.length < limit && (
        <TouchableOpacity style={styles.uploadButton} onPress={takeFromCamera} activeOpacity={0.7}>
          <Ionicons name={isVideo ? "videocam-outline" : "camera-outline"} size={24} color={COLORS.fourth} />
          <Text style={styles.uploadButtonText}>
            {uris.length > 0 ? "Add More" : "Upload"} {isVideo ? "Video" : "Photo"}
          </Text>
        </TouchableOpacity>
      )}

      {uris.length > 0 && !isReadOnly && (
        <View style={styles.uploadedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.uploadedText}>
            {uris.length} {isVideo ? "video" : "photo"}{uris.length > 1 ? "s" : ""} uploaded
          </Text>
        </View>
      )}

      {/* Video Player Modal */}
      {isVideo && (
        <Modal
          visible={isPlayerOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsPlayerOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.videoModalContent}>
              <View style={styles.videoModalHeader}>
                <Text style={styles.videoModalTitle} numberOfLines={1}>
                  {label}
                </Text>
                <TouchableOpacity
                  style={styles.videoModalCloseBtn}
                  onPress={() => setIsPlayerOpen(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.videoModalPlayerContainer}>
                {isPlayerOpen && <ReadOnlyVideoPlayer uri={uris[0]} />}
              </View>
              
              <TouchableOpacity
                style={styles.videoModalCloseFullBtn}
                onPress={() => setIsPlayerOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.videoModalCloseFullBtnText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray700,
    marginBottom: 10,
  },
  required: {
    color: COLORS.danger,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  tapButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    alignItems: "center",
  },
  tapButtonSelected: {
    borderColor: COLORS.fourth,
  },
  tapButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray600,
  },
  tapButtonTextSelected: {
    color: COLORS.secondary,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    alignItems: "center",
  },
  conditionButtonSelected: {
    borderColor: COLORS.fourth,
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray600,
  },
  conditionButtonTextSelected: {
    color: COLORS.secondary,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.secondary,
  },
  sliderUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray600,
    marginLeft: 12,
  },
  sliderBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: COLORS.fourth,
    borderRadius: 4,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  numberInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.secondary,
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray600,
    marginLeft: 12,
  },
  textArea: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.secondary,
    minHeight: 100,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray700,
    flex: 1,
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray200,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: COLORS.fourth,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  // Media Upload
  previewRow: {
    marginBottom: 10,
  },
  previewContainer: {
    position: "relative",
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.gray200,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 123, 255, 0.05)",
    borderWidth: 2,
    borderColor: COLORS.fourth,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.fourth,
    marginLeft: 8,
  },
  uploadedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  uploadedText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
    marginLeft: 4,
  },

  // ── Upload Source Modal ────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  pickerModal: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderBottomWidth: 0,
  },
  pickerHeader: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  pickerIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(0, 123, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.fourth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.secondary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  pickerSubtitle: {
    fontSize: 14,
    color: COLORS.third,
    fontWeight: "500",
  },
  pickerDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 20,
    marginBottom: 8,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  pickerOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  pickerOptionText: {
    flex: 1,
  },
  pickerOptionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 2,
  },
  pickerOptionSub: {
    fontSize: 12,
    color: COLORS.third,
    fontWeight: "500",
  },
  pickerCancel: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: COLORS.gray200,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  pickerCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  videoPlayerContainer: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  videoPlayerWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: 10,
  },
  videoRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  previewContainerReadOnly: {
    marginRight: 0,
    marginBottom: 10,
    width: "100%",
  },
  previewImageReadOnly: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    resizeMode: "cover",
  },
  // Video Preview Card
  videoPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  videoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(0, 123, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  videoInfo: {
    flex: 1,
    marginRight: 8,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 2,
  },
  videoSubtitle: {
    fontSize: 12,
    color: COLORS.third,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.fourth,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  videoRemoveBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Video Modal Styles
  videoModalContent: {
    backgroundColor: "#1A1919",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 0,
    paddingBottom: 40,
  },
  videoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  videoModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.secondary,
    flex: 1,
    marginRight: 12,
  },
  videoModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoModalPlayerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  videoModalCloseFullBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  videoModalCloseFullBtnText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
