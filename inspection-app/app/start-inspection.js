import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import inspectionSchema2W from "../utils/reecomm_inspection_2W.json";

export default function StartInspectionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Vehicle and inspection state
  const [vehicleCategory, setVehicleCategory] = useState(null); // "2W" or "4W"
  const [vehicleSubtype, setVehicleSubtype] = useState(null);
  const [fuelType, setFuelType] = useState(null);
  const [currentStep, setCurrentStep] = useState("vehicle_selection"); // vehicle_selection, inspection_form

  // Mock vehicle data - in real app, fetch from API
  const vehicleData = {
    id: params.id || "1",
    carModel: "Honda Activa 6G",
    carNumber: "MH-12-AB-1234",
    category: "2W", // This would come from backend
  };

  useEffect(() => {
    // Set vehicle category from vehicle data
    setVehicleCategory(vehicleData.category);
  }, []);

  const handleSubtypeSelection = (subtype) => {
    setVehicleSubtype(subtype);
  };

  const handleFuelTypeSelection = (fuel) => {
    setFuelType(fuel);
  };

  const handleStartInspection = () => {
    if (!vehicleSubtype || !fuelType) {
      Alert.alert("Required", "Please select vehicle subtype and fuel type");
      return;
    }
    setCurrentStep("inspection_form");
  };

  const renderVehicleSelection = () => {
    const subtypes = inspectionSchema2W.supported_subtypes;
    const fuelTypes = inspectionSchema2W.supported_fuel_types;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.vehicleIconContainer}>
            <Ionicons name="bicycle" size={40} color="#1E56A0" />
          </View>
          <Text style={styles.vehicleModel}>{vehicleData.carModel}</Text>
          <Text style={styles.vehicleNumber}>{vehicleData.carNumber}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>2 Wheeler Inspection</Text>
          </View>
        </View>

        {/* Vehicle Subtype Selection */}
        <View style={styles.sectionCardMain}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={20} color="#1E56A0" />
            <Text style={styles.sectionTitle}>Select Vehicle Type</Text>
          </View>

          <View style={styles.optionsGrid}>
            {subtypes.map((subtype) => (
              <TouchableOpacity
                key={subtype}
                style={[
                  styles.optionCard,
                  vehicleSubtype === subtype && styles.optionCardSelected,
                ]}
                onPress={() => handleSubtypeSelection(subtype)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    subtype === "Motorcycle"
                      ? "bicycle"
                      : subtype === "Scooter"
                        ? "bicycle"
                        : subtype === "Electric Scooter"
                          ? "flash"
                          : "bicycle"
                  }
                  size={32}
                  color={vehicleSubtype === subtype ? "#fff" : "#1E56A0"}
                />
                <Text
                  style={[
                    styles.optionText,
                    vehicleSubtype === subtype && styles.optionTextSelected,
                  ]}
                >
                  {subtype}
                </Text>
                {vehicleSubtype === subtype && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fuel Type Selection */}
        <View style={styles.sectionCardMain}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water-outline" size={20} color="#1E56A0" />
            <Text style={styles.sectionTitle}>Select Fuel Type</Text>
          </View>

          <View style={styles.optionsGrid}>
            {fuelTypes.map((fuel) => (
              <TouchableOpacity
                key={fuel}
                style={[
                  styles.optionCard,
                  fuelType === fuel && styles.optionCardSelected,
                ]}
                onPress={() => handleFuelTypeSelection(fuel)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    fuel === "Petrol"
                      ? "water"
                      : fuel === "EV (Electric)"
                        ? "flash"
                        : fuel === "Hybrid"
                          ? "leaf"
                          : "water"
                  }
                  size={32}
                  color={fuelType === fuel ? "#fff" : "#1E56A0"}
                />
                <Text
                  style={[
                    styles.optionText,
                    fuelType === fuel && styles.optionTextSelected,
                  ]}
                >
                  {fuel}
                </Text>
                {fuelType === fuel && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            (!vehicleSubtype || !fuelType) && styles.startButtonDisabled,
          ]}
          onPress={handleStartInspection}
          disabled={!vehicleSubtype || !fuelType}
        >
          <Text style={styles.startButtonText}>Start Inspection</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderInspectionForm = () => {
    // Determine which sections to show based on fuel type
    const isEV = fuelType === "EV (Electric)";
    const sections = [
      {
        id: "section_1",
        key: isEV ? "section_1_ev_battery" : "section_1_engine_powertrain",
        label: isEV ? "Battery & EV Powertrain" : "Engine & Powertrain",
        icon: isEV ? "flash" : "settings",
      },
      {
        id: "section_2",
        key: "section_2_mechanical",
        label: "Mechanical Components",
        icon: "construct",
      },
      {
        id: "section_3",
        key: "section_3_exterior_panels",
        label: "Exterior Panels",
        icon: "car-sport",
      },
      {
        id: "section_4",
        key: "section_4_glass_exterior_electronics",
        label: "Glass & Exterior",
        icon: "bulb",
      },
      {
        id: "section_5",
        key: "section_5_comfort_electronics",
        label: "Comfort & Electronics",
        icon: "phone-portrait",
      },
      {
        id: "section_6",
        key: "section_6_structural_history",
        label: "Structural History",
        icon: "shield-checkmark",
      },
      {
        id: "section_7",
        key: "section_7_tyres",
        label: "Tyres",
        icon: "ellipse",
      },
      {
        id: "section_8",
        key: "section_8_obd_diagnostics",
        label: "OBD / Diagnostics",
        icon: "hardware-chip",
      },
      {
        id: "section_9",
        key: "section_9_modifications",
        label: "Modifications",
        icon: "build",
      },
      {
        id: "section_10",
        key: "section_10_media",
        label: "Media & Documentation",
        icon: "images",
      },
    ];

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Inspection Progress</Text>
            <Text style={styles.progressSubtitle}>
              {vehicleData.carModel} • {vehicleSubtype} • {fuelType}
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>0%</Text>
          </View>
        </View>

        {/* Section Cards */}
        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => (
            <TouchableOpacity
              key={section.id}
              style={styles.sectionCard}
              activeOpacity={0.7}
              onPress={() => {
                router.push(`/inspection-section?sectionKey=${section.key}`);
              }}
            >
              <View style={styles.sectionIconContainer}>
                <Ionicons name={section.icon} size={28} color="#1E56A0" />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionNumber}>Section {index + 1}</Text>
                <Text style={styles.sectionTitle}>{section.label}</Text>
                <View style={styles.sectionStatus}>
                  <Ionicons name="ellipse" size={8} color="#9CA3AF" />
                  <Text style={styles.sectionStatusText}>Not Started</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => Alert.alert("Submit", "Submit inspection for review")}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Submit Inspection</Text>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {currentStep === "vehicle_selection"
        ? renderVehicleSelection()
        : renderInspectionForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerCard: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  vehicleModel: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E56A0",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E56A0",
  },
  sectionCardMain: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  optionCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    margin: "1%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  optionCardSelected: {
    backgroundColor: "#1E56A0",
    borderColor: "#1E56A0",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#fff",
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  progressHeader: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    borderWidth: 4,
    borderColor: "#1E56A0",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E56A0",
  },
  sectionsContainer: {
    padding: 16,
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  sectionContent: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E56A0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  sectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionStatusText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 6,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E56A0",
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#1E56A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
});
