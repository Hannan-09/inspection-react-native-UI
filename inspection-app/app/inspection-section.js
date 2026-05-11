import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  TapButtons,
  ConditionButtons,
  SliderInput,
  NumberInput,
  TextArea,
  MiniToggle,
  MediaUpload,
} from "../components/inspection/FormField";
import inspectionSchema2W from "../utils/reecomm_inspection_2W.json";

export default function InspectionSectionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const sectionKey = params.sectionKey || "section_1_engine_powertrain";
  const sectionData = inspectionSchema2W.sections[sectionKey];

  const [formData, setFormData] = useState({});

  const updateField = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Validate required fields
    // TODO: Save to local state or API
    Alert.alert("Saved", "Section data saved successfully");
    router.back();
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = formData[fieldName];
    const label = fieldName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Media URL fields
    if (fieldConfig.type === "media_url") {
      return (
        <MediaUpload
          key={fieldName}
          label={label}
          value={value}
          onChange={(val) => updateField(fieldName, val)}
          required={fieldConfig.required}
          type={fieldConfig.description?.includes("video") ? "video" : "photo"}
        />
      );
    }

    // Tap buttons (Pass/Fail/N/A)
    if (fieldConfig.input_ui === "tap_buttons") {
      return (
        <TapButtons
          key={fieldName}
          label={label}
          value={value}
          onChange={(val) => updateField(fieldName, val)}
          required={fieldConfig.required}
        />
      );
    }

    // Condition buttons (None/Minor/Major)
    if (fieldConfig.input_ui === "condition_buttons") {
      return (
        <ConditionButtons
          key={fieldName}
          label={label}
          value={value}
          onChange={(val) => updateField(fieldName, val)}
          required={fieldConfig.required}
        />
      );
    }

    // Slider (percentage)
    if (fieldConfig.input_ui === "slider") {
      return (
        <SliderInput
          key={fieldName}
          label={label}
          value={value}
          onChange={(val) => updateField(fieldName, val)}
          required={fieldConfig.required}
          unit={fieldConfig.unit || "%"}
        />
      );
    }

    // Number input
    if (
      fieldConfig.input_ui === "number_input" ||
      fieldConfig.type === "number"
    ) {
      return (
        <NumberInput
          key={fieldName}
          label={label}
          value={value}
          onChange={(val) => updateField(fieldName, val)}
          required={fieldConfig.required}
          unit={fieldConfig.unit || ""}
        />
      );
    }

    // Text area
    if (fieldConfig.input_ui === "textarea" || fieldConfig.type === "string") {
      return (
        <TextArea
          key={fieldName}
          label={label}
          value={value}
          onChange={(val) => updateField(fieldName, val)}
          required={fieldConfig.required}
          placeholder={fieldConfig.description || ""}
        />
      );
    }

    // Mini toggle (boolean)
    if (
      fieldConfig.input_ui === "mini_toggle" ||
      fieldConfig.type === "boolean"
    ) {
      return (
        <MiniToggle
          key={fieldName}
          label={label}
          value={value}
          onChange={(val) => updateField(fieldName, val)}
          required={fieldConfig.required}
        />
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {sectionData?.label || "Section"}
          </Text>
          <Text style={styles.headerSubtitle}>Fill all required fields</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Note */}
        {sectionData?.note && (
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={20} color="#1E56A0" />
            <Text style={styles.noteText}>{sectionData.note}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formCard}>
          {sectionData?.fields &&
            Object.entries(sectionData.fields).map(
              ([fieldName, fieldConfig]) => {
                // Skip conditional fields for now (TODO: implement conditional logic)
                if (fieldConfig.conditional_show) return null;

                return (
                  <View key={fieldName}>
                    {renderField(fieldName, fieldConfig)}
                    {fieldConfig.note && (
                      <Text style={styles.fieldNote}>{fieldConfig.note}</Text>
                    )}
                  </View>
                );
              },
            )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Section</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1E56A0",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  noteCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: "#1E56A0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    marginLeft: 12,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: -12,
    marginBottom: 16,
  },
  bottomButtons: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
});
