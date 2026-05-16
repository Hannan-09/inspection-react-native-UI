import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { inspectionAPI } from "../services/api/inspectionAPI";

export default function InspectionReportScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const inspectionId = params.id || "unknown";
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await inspectionAPI.getInspectionReport(inspectionId);
      const data = res.data || res;
      setReport(data);

      const fuelType = data.fuelType || "Petrol";
      const isEV = fuelType.includes("Electric") || fuelType.toUpperCase() === "EV";
      const is4W = (data.vehicleType || "4W") === "4W";

      const sectionList = [
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

      setSections(sectionList);
    } catch (e) {
      console.error("Error loading report data:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E56A0" />
        <Text style={styles.loadingText}>Fetching Report...</Text>
      </View>
    );
  }

  if (!report) return (
    <View style={styles.loadingContainer}>
      <Text>Report not found</Text>
    </View>
  );

  const is4W = (report.vehicleType || "4W") === "4W";

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vehicle Header Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name={is4W ? "car-sport" : "bicycle"} size={32} color="#1E56A0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.makerName}>{report.makerName} {report.modelName}</Text>
              <Text style={styles.regNumber}>{report.regNumber}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{report.vehicleSubType || "SUV"}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: "#DBEAFE" }]}>
                  <Text style={[styles.badgeText, { color: "#1E40AF" }]}>{report.fuelType}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Report Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionHeading}>Inspection Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{report.inspectionScore?.toFixed(1) || "0.0"}</Text>
              <Text style={styles.statLabel}>Total Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#16A34A" }]}>{report.passedCheckpoints}/{report.totalCheckpoints}</Text>
              <Text style={styles.statLabel}>Passed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: report.overallRiskLevel === "High" ? "#EF4444" : "#F59E0B" }]}>{report.overallRiskLevel}</Text>
              <Text style={styles.statLabel}>Risk Level</Text>
            </View>
          </View>
        </View>

        {/* Section Breakdown */}
        <Text style={styles.breakdownTitle}>Detailed Breakdown</Text>
        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => {
            return (
              <TouchableOpacity 
                key={section.id} 
                style={styles.sectionItem}
                onPress={() => {
                  // In a real app, this would open a detailed view of that section
                  router.push(`/inspection-section?sectionKey=${section.key}&vehicleCategory=${is4W ? "4W" : "2W"}&inspectionId=${inspectionId}&readOnly=true&fuelType=${encodeURIComponent(report.fuelType || "")}&vehicleSubType=${encodeURIComponent(report.vehicleSubType || "")}`);
                }}
              >
                <View style={styles.sectionIcon}>
                  <Ionicons name={section.icon} size={24} color="#1E56A0" />
                </View>
                <View style={styles.sectionText}>
                  <Text style={styles.sectionNumber}>SECTION {index + 1}</Text>
                  <Text style={styles.sectionLabel}>{section.label}</Text>
                </View>
                <View style={styles.statusIndicator}>
                  <Text style={styles.statusText}>View</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.downloadButton} activeOpacity={0.8}>
          <Ionicons name="cloud-download-outline" size={20} color="#fff" />
          <Text style={styles.downloadText}>Download PDF Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  vehicleCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  makerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  regNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E56A0",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E56A0",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  breakdownTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginTop: 24,
    marginLeft: 20,
    marginBottom: 12,
  },
  sectionsContainer: {
    paddingHorizontal: 16,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sectionText: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E56A0",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    marginRight: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
});
