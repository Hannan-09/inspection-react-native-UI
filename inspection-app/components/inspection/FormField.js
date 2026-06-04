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

// ── Tap Buttons (Pass / Fail / N/A) ─────────────────────────────────────────

export const TapButtons = ({ value, onChange, label, required, options = ["Pass", "Fail", "N/A"] }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.buttonRow}>
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.tapButton,
                isSelected && styles.tapButtonSelected,
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
                  isSelected && styles.tapButtonTextSelected,
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

export const ConditionButtons = ({ value, onChange, label, required }) => {
  const options = ["None", "Minor", "Major"];

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.buttonRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.conditionButton,
              value === option && styles.conditionButtonSelected,
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
                value === option && styles.conditionButtonTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
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
      <View style={[styles.numberInputContainer, isReadOnly && { backgroundColor: COLORS.gray100, borderColor: COLORS.gray200 }]}>
        <TextInput
          style={[styles.numberInput, isReadOnly && { color: COLORS.gray700 }]}
          value={localText}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder="Enter value"
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
        style={[styles.textArea, isReadOnly && { backgroundColor: COLORS.gray100, borderColor: COLORS.gray200, color: COLORS.gray700 }]}
        value={value || ""}
        onChangeText={onChange}
        placeholder={placeholder}
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
  const [pickerVisible, setPickerVisible] = useState(false);

  const uris = value
    ? Array.isArray(value) ? value : [value]
    : [];

  const limit = maxCount || (type === "video" ? 1 : 99);

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow photo library access in Settings.");
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    setPickerVisible(false);
    if (uris.length >= limit) {
      Alert.alert("Limit Reached", `You can only upload up to ${limit} ${type}(s).`);
      return;
    }

    const granted = await requestLibraryPermission();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === "video" ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: limit > 1,
      quality: 0.8,
      selectionLimit: limit - uris.length,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      let merged = [...uris, ...newUris];
      if (merged.length > limit) merged = merged.slice(0, limit);
      onChange(merged.length === 1 ? merged[0] : merged);
    }
  };

  const takeFromCamera = async () => {
    setPickerVisible(false);
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
          <View style={styles.videoPlayerWrapper}>
            <ReadOnlyVideoPlayer uri={uris[0]} />
            {!isReadOnly && (
              <TouchableOpacity style={styles.videoRemoveButton} onPress={() => removeMedia(0)}>
                <Ionicons name="close-circle" size={26} color={COLORS.danger} />
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
      {!isReadOnly && (
        <TouchableOpacity style={styles.uploadButton} onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
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

      {/* ── Beautiful Upload Source Modal ──────────────────────────── */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.pickerModal}>
            {/* Header */}
            <View style={styles.pickerHeader}>
              <View style={styles.pickerIconBg}>
                <Ionicons name={isVideo ? "videocam" : "camera"} size={26} color={COLORS.fourth} />
              </View>
              <Text style={styles.pickerTitle}>{isVideo ? "Upload Video" : "Upload Photo"}</Text>
              <Text style={styles.pickerSubtitle}>Choose a source</Text>
            </View>
 
            {/* Divider */}
            <View style={styles.pickerDivider} />
 
            {/* Options */}
            <TouchableOpacity style={styles.pickerOption} onPress={takeFromCamera} activeOpacity={0.7}>
              <View style={[styles.pickerOptionIcon, { backgroundColor: "rgba(0, 123, 255, 0.12)" }]}>
                <Ionicons name="camera" size={22} color={COLORS.fourth} />
              </View>
              <View style={styles.pickerOptionText}>
                <Text style={styles.pickerOptionTitle}>Camera</Text>
                <Text style={styles.pickerOptionSub}>{isVideo ? "Record a new video" : "Take a new photo"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#AEAEB2" />
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setPickerVisible(false)} activeOpacity={0.7}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    backgroundColor: COLORS.gray50,
    borderWidth: 2,
    borderColor: COLORS.gray200,
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
  },
  numberInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    backgroundColor: COLORS.gray50,
    borderWidth: 2,
    borderColor: COLORS.gray200,
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
});
