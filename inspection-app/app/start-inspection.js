import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inspectionAPI } from "../services/api/inspectionAPI";
import inspectionSchema2W from "../reecomm_inspection_2W.json";
import inspectionSchema4W from "../reecomm_inspection_4W.json";
import ThemeBackground from "../components/ThemeBackground";

// ── Normalizers ────────────────────────────────────────────────────────────────
const normalizeCategory = (vehicleType) => {
  const t = (vehicleType || "").toUpperCase();
  if (t.includes("FOUR") || t === "4W" || t.includes("4")) return "4W";
  if (t.includes("TWO") || t === "2W" || t.includes("2")) return "2W";
  return "4W";
};

const normalizeFuelType = (fuelType) => {
  const f = (fuelType || "").toUpperCase();
  if (f === "PETROL") return "Petrol";
  if (f === "DIESEL") return "Diesel";
  if (f === "CNG") return "CNG";
  if (f === "LPG") return "LPG";
  if (f === "HYBRID") return "Hybrid";
  if (f.includes("ELECTRIC") || f === "EV") return "EV (Electric)";
  return fuelType || "Petrol";
};

const normalizeSubtype = (subtype, category) => {
  const s = (subtype || "").toUpperCase().replace(/_/g, " ");
  if (category === "4W") {
    if (s.includes("HATCHBACK")) return "Hatchback";
    if (s.includes("SEDAN")) return "Sedan";
    if (s.includes("SUV") || s.includes("MUV")) return "SUV / MUV";
    if (s.includes("CROSSOVER")) return "Crossover";
    if (s.includes("VAN") || s.includes("MPV")) return "Van / MPV";
    if (s.includes("PICKUP") || s.includes("TRUCK")) return "Pickup Truck";
    return "Sedan";
  } else {
    if (s.includes("ELECTRIC") && s.includes("SCOOTER")) return "Electric Scooter";
    if (s.includes("SCOOTER")) return "Scooter";
    if (s.includes("MOTORCYCLE") || s.includes("BIKE")) return "Motorcycle";
    if (s.includes("MOPED")) return "Moped";
    return "Motorcycle";
  }
};

export default function StartInspectionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const inspectionId = params.id || "unknown";

  // Normalize values from API params
  const resolvedCategory = normalizeCategory(params.vehicleCategory || params.vehicleType);
  const resolvedSubtype = normalizeSubtype(params.vehicleSubtype || params.vehicleSubType, resolvedCategory);
  const resolvedFuelType = normalizeFuelType(params.fuelType);

  const isElectric = (params.fuelType || "").toUpperCase().includes("ELECTRIC") || (params.fuelType || "").toUpperCase() === "EV";
  const hasPrefilledData = isElectric 
    ? !!params.fuelType 
    : (!!(params.vehicleSubtype || params.vehicleSubType) && !!params.fuelType);

  const schema = resolvedCategory === "4W" ? inspectionSchema4W : inspectionSchema2W;

  // Manual selection state (fallback only when data not pre-filled)
  const [vehicleSubtype, setVehicleSubtype] = useState(hasPrefilledData ? resolvedSubtype : null);
  const [fuelType, setFuelType] = useState(hasPrefilledData ? resolvedFuelType : null);
  const [currentStep, setCurrentStep] = useState(hasPrefilledData ? "inspection_form" : "vehicle_selection");
  const [sectionProgress, setSectionProgress] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const vehicleDisplay = {
    makerName: params.makerName || "",
    modelName: params.modelName || "",
    regNumber: params.regNumber || "",
  };

  useEffect(() => {
    loadProgress();
  }, []);

  // Reload progress every time we return to this screen from a section
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [inspectionId])
  );

  const loadProgress = async () => {
    try {
      const raw = await AsyncStorage.getItem(`inspection_${inspectionId}_progress`);
      if (raw) setSectionProgress(JSON.parse(raw));
    } catch (e) {
      console.error("Error loading progress:", e);
    }
  };

  // ── Section List ──────────────────────────────────────────────────────────────
  const getSections = () => {
    const isEV = (fuelType || resolvedFuelType) === "EV (Electric)";
    const is4W = resolvedCategory === "4W";

    const list = [
      {
        id: "section_1",
        key: isEV ? "section_1_ev_battery" : "section_1_engine_powertrain",
        label: isEV ? "Battery & EV Powertrain" : "Engine & Powertrain",
        icon: isEV ? "flash" : "settings",
      },
      { id: "section_2", key: "section_2_mechanical", label: "Mechanical Components", icon: "construct" },
      { id: "section_3", key: "section_3_exterior_panels", label: "Exterior Panels", icon: "car-sport" },
      {
        id: "section_4",
        key: "section_4_glass_exterior_electronics",
        label: is4W ? "Glass & Exterior Electronics" : "Glass & Exterior",
        icon: "bulb",
      },
      {
        id: "section_5",
        key: is4W ? "section_5_interior_cabin" : "section_5_comfort_electronics",
        label: is4W ? "Interior & Cabin" : "Comfort & Electronics",
        icon: is4W ? "home" : "phone-portrait",
      },
      { id: "section_6", key: "section_6_structural_history", label: "Structural History", icon: "shield-checkmark" },
      { id: "section_7", key: "section_7_tyres", label: "Tyres", icon: "ellipse" },
      ...(!isEV ? [{ id: "section_8", key: "section_8_obd_diagnostics", label: "OBD / Diagnostics", icon: "hardware-chip" }] : []),
      { id: "section_9", key: "section_9_modifications", label: "Modification Check", icon: "build" },
      { id: "section_10", key: "section_10_media", label: "Media & Documentation", icon: "images" },
    ];
    return list;
  };

  const handleSubmit = async () => {
    const sections = getSections();
    const completedCount = sections.filter((s) => sectionProgress[s.key] === "completed").length;
    if (completedCount < sections.length) {
      Alert.alert(
        "Incomplete",
        `You have completed ${completedCount} of ${sections.length} sections. Submit anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit", style: "destructive", onPress: doSubmit },
        ]
      );
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    try {
      setSubmitting(true);
      if (resolvedCategory === "2W") {
        await inspectionAPI.submitInspection2W(inspectionId);
      } else {
        await inspectionAPI.submitInspection(inspectionId);
      }

      // Clear local storage for this inspection
      try {
        const sections = getSections();
        const keysToRemove = [
          `inspection_${inspectionId}_progress`,
          `inspection_${inspectionId}_video_completed`,
          ...sections.map(s => `inspection_${inspectionId}_${s.key}`)
        ];
        await AsyncStorage.multiRemove(keysToRemove);
      } catch (storageErr) {
        console.error("Error clearing local storage:", storageErr);
      }

      Alert.alert("Submitted", "Inspection submitted for review successfully.", [
        { text: "OK", onPress: () => router.replace("/inspections") },
      ]);
    } catch (error) {
      console.error("Error submitting inspection:", error);
      Alert.alert("Error", "Failed to submit inspection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Vehicle Selection (manual fallback) ───────────────────────────────────────
  const renderVehicleSelection = () => {
    const subtypes = schema.supported_subtypes || [];
    const fuelTypes = schema.supported_fuel_types || [];

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.vehicleIconContainer}>
            <Ionicons name={resolvedCategory === "4W" ? "car-sport" : "bicycle"} size={40} color={COLORS.fourth} />
          </View>
          <Text style={styles.vehicleModel}>
            {vehicleDisplay.makerName} {vehicleDisplay.modelName}
          </Text>
          {!!vehicleDisplay.regNumber && (
            <Text style={styles.vehicleNumber}>{vehicleDisplay.regNumber}</Text>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{resolvedCategory === "4W" ? "4 Wheeler" : "2 Wheeler"} Inspection</Text>
          </View>
        </View>

        {/* Subtype */}
        <View style={styles.sectionCardMain}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={20} color={COLORS.fourth} />
            <Text style={styles.sectionTitle}>Select Vehicle Type</Text>
          </View>
          <View style={styles.optionsGrid}>
            {subtypes.map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[styles.optionCard, vehicleSubtype === sub && styles.optionCardSelected]}
                onPress={() => setVehicleSubtype(sub)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={resolvedCategory === "4W" ? "car-sport" : sub === "Electric Scooter" ? "flash" : "bicycle"}
                  size={28}
                  color={vehicleSubtype === sub ? "#FFFFFF" : COLORS.fourth}
                />
                <Text style={[styles.optionText, vehicleSubtype === sub && styles.optionTextSelected]}>{sub}</Text>
                {vehicleSubtype === sub && (
                  <View style={styles.selectedBadge}><Ionicons name="checkmark-circle" size={18} color="#FFFFFF" /></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fuel Type */}
        <View style={styles.sectionCardMain}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water-outline" size={20} color={COLORS.fourth} />
            <Text style={styles.sectionTitle}>Select Fuel Type</Text>
          </View>
          <View style={styles.optionsGrid}>
            {fuelTypes.map((fuel) => (
              <TouchableOpacity
                key={fuel}
                style={[styles.optionCard, fuelType === fuel && styles.optionCardSelected]}
                onPress={() => setFuelType(fuel)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={fuel.includes("Electric") ? "flash" : fuel === "Hybrid" ? "leaf" : "water"}
                  size={28}
                  color={fuelType === fuel ? "#FFFFFF" : COLORS.fourth}
                />
                <Text style={[styles.optionText, fuelType === fuel && styles.optionTextSelected]}>{fuel}</Text>
                {fuelType === fuel && (
                  <View style={styles.selectedBadge}><Ionicons name="checkmark-circle" size={18} color="#FFFFFF" /></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, (!vehicleSubtype || !fuelType) && styles.startButtonDisabled]}
          onPress={() => {
            if (!vehicleSubtype || !fuelType) {
              Alert.alert("Required", "Please select vehicle type and fuel type.");
              return;
            }
            setCurrentStep("inspection_form");
          }}
          disabled={!vehicleSubtype || !fuelType}
        >
          <Text style={styles.startButtonText}>Start Inspection</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ── Inspection Form (section list) ────────────────────────────────────────────
  const renderInspectionForm = () => {
    const sections = getSections();
    const completedCount = sections.filter((s) => sectionProgress[s.key] === "completed").length;
    const progressPct = Math.round((completedCount / sections.length) * 100);
    const activeFuelType = fuelType || resolvedFuelType;
    const activeSubtype = vehicleSubtype || resolvedSubtype;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Vehicle info banner */}
        <View style={styles.vehicleBanner}>
          <View style={styles.vehicleBannerIcon}>
            <Ionicons name={resolvedCategory === "4W" ? "car-sport" : "bicycle"} size={28} color={COLORS.fourth} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleBannerModel}>
              {vehicleDisplay.makerName} {vehicleDisplay.modelName}
            </Text>
            {!!vehicleDisplay.regNumber && (
              <Text style={styles.vehicleBannerReg}>{vehicleDisplay.regNumber}</Text>
            )}
            <View style={styles.vehicleBannerTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{activeSubtype}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: "rgba(0, 123, 255, 0.15)", borderColor: "rgba(0, 123, 255, 0.3)", borderWidth: 1 }]}>
                <Text style={[styles.tagText, { color: COLORS.fourth }]}>{activeFuelType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Inspection Progress</Text>
            <Text style={styles.progressCount}>{completedCount}/{sections.length} sections done</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>{progressPct}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
        </View>

        {/* Section Cards */}
        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => {
            const isDone = sectionProgress[section.key] === "completed";
            return (
              <TouchableOpacity
                key={section.id}
                style={[styles.sectionCard, isDone && styles.sectionCardDone]}
                activeOpacity={0.7}
                onPress={() => {
                  router.push(
                    `/inspection-section?sectionKey=${section.key}&vehicleCategory=${resolvedCategory}&inspectionId=${inspectionId}&fuelType=${encodeURIComponent(activeFuelType)}&vehicleSubType=${encodeURIComponent(activeSubtype)}`
                  );
                }}
              >
                <View style={[styles.sectionIconContainer, isDone && { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.3)" }]}>
                  <Ionicons
                    name={isDone ? "checkmark-circle" : section.icon}
                    size={26}
                    color={isDone ? COLORS.success : COLORS.fourth}
                  />
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionNumber}>Section {index + 1}</Text>
                  <Text style={styles.sectionLabel}>{section.label}</Text>
                  <View style={styles.sectionStatus}>
                    <Ionicons name="ellipse" size={7} color={isDone ? COLORS.success : COLORS.third} />
                    <Text style={[styles.sectionStatusText, isDone && { color: COLORS.success }]}>
                      {isDone ? "Completed" : "Not Started"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Inspection</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <ThemeBackground style={{ flex: 1 }}>
      {currentStep === "vehicle_selection" ? renderVehicleSelection() : renderInspectionForm()}
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  // ── Header card (manual selection) ────────────────────────────
  headerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  vehicleIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  vehicleModel: { fontSize: 20, fontWeight: "bold", color: COLORS.secondary, marginBottom: 2, textAlign: "center" },
  vehicleNumber: { fontSize: 15, fontWeight: "600", color: COLORS.fourth, marginBottom: 10 },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  categoryText: { fontSize: 13, fontWeight: "600", color: COLORS.fourth },

  // ── Selection options ──────────────────────────────────────────
  sectionCardMain: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 0,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.secondary, marginLeft: 8 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  optionCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 14,
    padding: 16,
    margin: "1%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    position: "relative",
  },
  optionCardSelected: {
    backgroundColor: "rgba(0, 123, 255, 0.15)",
    borderColor: COLORS.fourth,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 12, fontWeight: "600", color: COLORS.third, marginTop: 10, textAlign: "center" },
  optionTextSelected: { color: COLORS.secondary },
  selectedBadge: { position: "absolute", top: 6, right: 6 },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonDisabled: { backgroundColor: "rgba(255, 255, 255, 0.08)", borderColor: "rgba(255, 255, 255, 0.05)", borderWidth: 1, shadowOpacity: 0 },
  startButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginRight: 8 },

  // ── Vehicle banner (inspection form) ──────────────────────────
  vehicleBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 0,
  },
  vehicleBannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  vehicleBannerModel: { fontSize: 16, fontWeight: "bold", color: COLORS.secondary },
  vehicleBannerReg: { fontSize: 13, fontWeight: "600", color: COLORS.fourth, marginTop: 1 },
  vehicleBannerTags: { flexDirection: "row", marginTop: 6, gap: 6 },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  tagText: { fontSize: 11, fontWeight: "600", color: COLORS.secondary },

  // ── Progress ───────────────────────────────────────────────────
  progressHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 0,
  },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.secondary, marginBottom: 4 },
  progressCount: { fontSize: 12, color: COLORS.third, fontWeight: "600" },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 2,
    borderColor: COLORS.fourth,
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: { fontSize: 13, fontWeight: "bold", color: COLORS.fourth },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: COLORS.success, borderRadius: 3 },

  // ── Section list ───────────────────────────────────────────────
  sectionsContainer: { padding: 16 },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 0,
  },
  sectionCardDone: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  sectionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sectionContent: { flex: 1 },
  sectionNumber: { fontSize: 10, fontWeight: "700", color: COLORS.third, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: COLORS.secondary, marginBottom: 4 },
  sectionStatus: { flexDirection: "row", alignItems: "center" },
  sectionStatusText: { fontSize: 12, color: COLORS.third, marginLeft: 5 },

  // ── Submit ─────────────────────────────────────────────────────
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.fourth,
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.fourth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginRight: 8 },
});
