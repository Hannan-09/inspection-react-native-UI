import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

// ── Tap Buttons (Pass / Fail / N/A) ─────────────────────────────────────────

export const TapButtons = ({ value, onChange, label, required }) => {
  const options = ["Pass", "Fail", "N/A"];

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
              styles.tapButton,
              value === option && styles.tapButtonSelected,
              option === "Pass" && value === option && styles.passSelected,
              option === "Fail" && value === option && styles.failSelected,
            ]}
            onPress={() => onChange(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tapButtonText,
                value === option && styles.tapButtonTextSelected,
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
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.numberInputContainer}>
        <TextInput
          style={styles.numberInput}
          value={value?.toString() || ""}
          onChangeText={(text) => onChange(parseFloat(text) || 0)}
          keyboardType="decimal-pad"
          placeholder="Enter value"
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
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={styles.textArea}
        value={value || ""}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
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

export const MediaUpload = ({
  value,
  onChange,
  label,
  required,
  type = "photo",
}) => {
  // value can be a single URI string or an array of URIs
  const uris = value
    ? Array.isArray(value)
      ? value
      : [value]
    : [];

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library in Settings to upload media.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    const granted = await requestPermission();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        type === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: type !== "video",
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      // Merge with existing
      const merged = [...uris, ...newUris];
      onChange(merged.length === 1 ? merged[0] : merged);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow camera access in Settings.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes:
        type === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newUri = result.assets[0].uri;
      const merged = [...uris, newUri];
      onChange(merged.length === 1 ? merged[0] : merged);
    }
  };

  const showOptions = () => {
    Alert.alert(
      type === "video" ? "Upload Video" : "Upload Photo",
      "Choose a source",
      [
        { text: "Camera", onPress: takePhoto },
        {
          text: type === "video" ? "Video Library" : "Photo Library",
          onPress: pickFromLibrary,
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const removeMedia = (index) => {
    const updated = uris.filter((_, i) => i !== index);
    onChange(updated.length === 0 ? null : updated.length === 1 ? updated[0] : updated);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Uploaded previews */}
      {uris.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.previewRow}
        >
          {uris.map((uri, index) => (
            <View key={index} style={styles.previewContainer}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(index)}
              >
                <Ionicons name="close-circle" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Upload button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={showOptions}
        activeOpacity={0.7}
      >
        <Ionicons
          name={type === "video" ? "videocam-outline" : "camera-outline"}
          size={24}
          color="#1E56A0"
        />
        <Text style={styles.uploadButtonText}>
          {uris.length > 0 ? "Add More" : "Upload"}{" "}
          {type === "video" ? "Video" : "Photo"}
        </Text>
      </TouchableOpacity>

      {uris.length > 0 && (
        <View style={styles.uploadedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          <Text style={styles.uploadedText}>
            {uris.length} {type === "video" ? "video" : "photo"}
            {uris.length > 1 ? "s" : ""} uploaded
          </Text>
        </View>
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
});
