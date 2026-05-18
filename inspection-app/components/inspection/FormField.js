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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";

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
          const isPassType = option === "Pass" || option === "True";
          const isFailType = option === "Fail" || option === "False";

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.tapButton,
                isSelected && styles.tapButtonSelected,
                isPassType && isSelected && styles.passSelected,
                isFailType && isSelected && styles.failSelected,
              ]}
              onPress={() => onChange(option)}
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
              option === "None" && value === option && styles.noneSelected,
              option === "Minor" && value === option && styles.minorSelected,
              option === "Major" && value === option && styles.majorSelected,
            ]}
            onPress={() => onChange(option)}
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
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.numberInputContainer, isReadOnly && { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" }]}>
        <TextInput
          style={[styles.numberInput, isReadOnly && { color: "#374151" }]}
          value={value?.toString() || ""}
          onChangeText={(text) => onChange(parseFloat(text) || 0)}
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
        style={[styles.textArea, isReadOnly && { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB", color: "#374151" }]}
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
        isReadOnly && isVideo ? (
          <ReadOnlyVideoPlayer uri={uris[0]} />
        ) : (
          <ScrollView horizontal={!isReadOnly} showsHorizontalScrollIndicator={false} style={styles.previewRow}>
            {uris.map((uri, index) => (
              <View key={index} style={[styles.previewContainer, isReadOnly && styles.previewContainerReadOnly]}>
                <Image source={{ uri }} style={[styles.previewImage, isReadOnly && styles.previewImageReadOnly]} />
                {!isReadOnly && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeMedia(index)}>
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
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
          <Ionicons name={isVideo ? "videocam-outline" : "camera-outline"} size={24} color="#1E56A0" />
          <Text style={styles.uploadButtonText}>
            {uris.length > 0 ? "Add More" : "Upload"} {isVideo ? "Video" : "Photo"}
          </Text>
        </TouchableOpacity>
      )}

      {uris.length > 0 && !isReadOnly && (
        <View style={styles.uploadedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
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
                <Ionicons name={isVideo ? "videocam" : "camera"} size={26} color="#1E56A0" />
              </View>
              <Text style={styles.pickerTitle}>{isVideo ? "Upload Video" : "Upload Photo"}</Text>
              <Text style={styles.pickerSubtitle}>Choose a source</Text>
            </View>

            {/* Divider */}
            <View style={styles.pickerDivider} />

            {/* Options */}
            <TouchableOpacity style={styles.pickerOption} onPress={takeFromCamera} activeOpacity={0.7}>
              <View style={[styles.pickerOptionIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="camera" size={22} color="#1E56A0" />
              </View>
              <View style={styles.pickerOptionText}>
                <Text style={styles.pickerOptionTitle}>Camera</Text>
                <Text style={styles.pickerOptionSub}>{isVideo ? "Record a new video" : "Take a new photo"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerOption} onPress={pickFromLibrary} activeOpacity={0.7}>
              <View style={[styles.pickerOptionIcon, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name={isVideo ? "film-outline" : "images-outline"} size={22} color="#16A34A" />
              </View>
              <View style={styles.pickerOptionText}>
                <Text style={styles.pickerOptionTitle}>{isVideo ? "Video Library" : "Photo Library"}</Text>
                <Text style={styles.pickerOptionSub}>Choose from your device</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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
    color: "#374151",
    marginBottom: 10,
  },
  required: {
    color: "#EF4444",
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
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  tapButtonSelected: {
    borderColor: "#1E56A0",
  },
  passSelected: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },
  failSelected: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
  },
  tapButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tapButtonTextSelected: {
    color: "#111827",
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  conditionButtonSelected: {
    borderColor: "#1E56A0",
  },
  noneSelected: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },
  minorSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  majorSelected: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  conditionButtonTextSelected: {
    color: "#111827",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sliderUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 12,
  },
  sliderBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#1E56A0",
    borderRadius: 4,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 12,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
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
    color: "#374151",
    flex: 1,
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#1E56A0",
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
    backgroundColor: "#E5E7EB",
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
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
    borderColor: "#1E56A0",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E56A0",
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
    color: "#16A34A",
    marginLeft: 4,
  },

  // ── Upload Source Modal ────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
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
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#1E56A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  pickerSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  pickerDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
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
    color: "#111827",
    marginBottom: 2,
  },
  pickerOptionSub: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  pickerCancel: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  pickerCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  videoPlayerContainer: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
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
