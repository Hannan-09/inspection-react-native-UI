import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { inspectionAPI } from "../services/api/inspectionAPI";
import { COLORS } from "../constants";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import ThemeBackground from "../components/ThemeBackground";

export default function InspectionReportScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const inspectionId = params.id || "unknown";
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [sections, setSections] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const vehicleCategory = params.vehicleCategory || params.vehicleType || "";
      const res = await inspectionAPI.getInspectionReport(inspectionId, vehicleCategory);
      const data = res.data || res;
      setReport(data);

      const fuelType = data.fuelType || "Petrol";
      const isEV = fuelType.includes("Electric") || fuelType.toUpperCase() === "EV";
      const is4W = data.vehicleType === "FOUR_WHEELER" || data.vehicleType === "4W";

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

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const htmlContent = generatePDFReport(report);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error("PDF generation/sharing error:", e);
      Alert.alert("Error", "Failed to generate or download the PDF report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <ThemeBackground style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={[styles.loadingText, { color: "#FFFFFF" }]}>Fetching Report...</Text>
      </ThemeBackground>
    );
  }

  if (!report) return (
    <ThemeBackground style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>Report not found</Text>
    </ThemeBackground>
  );

  const is4W = report.vehicleType === "FOUR_WHEELER" || report.vehicleType === "4W";

  return (
    <ThemeBackground style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vehicle Header Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name={is4W ? "car-sport" : "bicycle"} size={32} color={COLORS.fourth} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.makerName}>{report.makerName} {report.modelName}</Text>
              <Text style={styles.regNumber}>{report.regNumber}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{report.vehicleSubType || "SUV"}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)", borderWidth: 1 }]}>
                  <Text style={[styles.badgeText, { color: "#3B82F6" }]}>{report.fuelType}</Text>
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
                  router.push(`/inspection-section?sectionKey=${section.key}&vehicleCategory=${is4W ? "4W" : "2W"}&inspectionId=${inspectionId}&readOnly=true&fuelType=${encodeURIComponent(report.fuelType || "")}&vehicleSubType=${encodeURIComponent(report.vehicleSubType || "")}`);
                }}
              >
                <View style={styles.sectionIcon}>
                  <Ionicons name={section.icon} size={24} color={COLORS.fourth} />
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
        <TouchableOpacity 
          style={[styles.downloadButton, downloading && { opacity: 0.8 }]} 
          activeOpacity={0.8}
          onPress={handleDownloadPDF}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="cloud-download-outline" size={20} color="#fff" />
          )}
          <Text style={styles.downloadText}>
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </Text>
        </TouchableOpacity>
      </View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  vehicleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 0,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  makerName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.secondary,
    marginBottom: 4,
  },
  regNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.fourth,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 0,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.secondary,
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
    color: COLORS.fourth,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.third,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  breakdownTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.secondary,
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
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
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
    color: COLORS.fourth,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.secondary,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.third,
    marginRight: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: "rgba(26, 25, 25, 0.85)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
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
    color: "#FFFFFF",
    marginLeft: 8,
  },
});

const generatePDFReport = (report) => {
  const isEV = report.fuelType?.includes("Electric") || report.fuelType?.toUpperCase() === "EV";
  const is4W = report.vehicleType === "FOUR_WHEELER" || report.vehicleType === "4W";

  // Helper to escape HTML characters securely to prevent broken XML/HTML tags
  const escapeHtml = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Helper to safely format labels
  const toLabel = (str) => {
    if (!str) return "N/A";
    const formatted = str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
    return escapeHtml(formatted);
  };

  // Helper to format values nicely
  const formatVal = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("file://") || val.startsWith("content://"))) {
      const escapedUrl = val.replace(/&/g, "&amp;");
      return `<a href="${escapedUrl}" target="_blank" style="color: #007BFF; text-decoration: underline; font-size: 12px; word-break: break-all;">View Media Link</a>`;
    }
    return escapeHtml(String(val));
  };

  // 1. Engine / Powertrain Section
  let engineHTML = "";
  if (isEV) {
    const s = report.evBattery || {};
    engineHTML = `
      <div class="section-card">
        <h3>Section 1: Battery & EV Powertrain</h3>
        <table class="data-table">
          <tr><td>Motor Running Video</td><td>${formatVal(s.motorRunningVideo)}</td></tr>
          <tr><td>Battery State of Health (SOH)</td><td>${s.batterySohPercent ? s.batterySohPercent + "%" : "N/A"}</td></tr>
          <tr><td>Battery State of Charge (SOC)</td><td>${s.batterySocPercent ? s.batterySocPercent + "%" : "N/A"}</td></tr>
          <tr><td>Battery Pack Condition</td><td>${toLabel(s.batteryPackCondition)}</td></tr>
          <tr><td>Battery Thermal Cooling</td><td>${toLabel(s.batteryThermalCooling)}</td></tr>
          <tr><td>Charging Port Condition</td><td>${toLabel(s.chargingPortCondition)}</td></tr>
          <tr><td>BMS Warning Light</td><td>${toLabel(s.bmsWarningLight)}</td></tr>
          <tr><td>Range Indicator Functional</td><td>${toLabel(s.rangeIndicatorFunctional)}</td></tr>
          <tr><td>Motor Noise & Vibration</td><td>${toLabel(s.motorNoiseVibration)}</td></tr>
          <tr><td>Regenerative Braking Active</td><td>${toLabel(s.regenerativeBrakingActive)}</td></tr>
          <tr><td>HV Wiring Harness</td><td>${toLabel(s.hvWiringHarness)}</td></tr>
          <tr><td>DC/DC Converter</td><td>${toLabel(s.dcDcConverter)}</td></tr>
          ${is4W ? `<tr><td>Onboard Charger Status</td><td>${toLabel(s.onboardChargerStatus)}</td></tr>` : ""}
        </table>
      </div>
    `;
  } else {
    const s = report.engineAndPowertrain || {};
    engineHTML = `
      <div class="section-card">
        <h3>Section 1: Engine & Powertrain</h3>
        <table class="data-table">
          <tr><td>Engine Sound Video</td><td>${formatVal(s.engineSoundVideo)}</td></tr>
          <tr><td>Overheating</td><td>${toLabel(s.overheating)}</td></tr>
          <tr><td>Misfiring Smoke</td><td>${toLabel(s.misfiringSmoke)}</td></tr>
          <tr><td>Back Compression</td><td>${toLabel(s.backCompression)}</td></tr>
          <tr><td>Oil Leakage</td><td>${toLabel(s.oilLeakage)}</td></tr>
          <tr><td>Coolant Leakage</td><td>${toLabel(s.coolantLeakage)}</td></tr>
          <tr><td>Engine Mount Condition</td><td>${toLabel(s.engineMountCondition)}</td></tr>
          <tr><td>Gaskets & Seals</td><td>${toLabel(s.gasketsAndSeals)}</td></tr>
          <tr><td>Throttle Body</td><td>${toLabel(s.throttleBody)}</td></tr>
          <tr><td>Exhaust Leaks</td><td>${toLabel(s.exhaustLeaks)}</td></tr>
          ${is4W ? `<tr><td>Catalytic Converter</td><td>${toLabel(s.catalyticConverter)}</td></tr>` : ""}
          <tr><td>Fuel Tank</td><td>${toLabel(s.fuelTank)}</td></tr>
          <tr><td>Fuel Lines</td><td>${toLabel(s.fuelLines)}</td></tr>
          <tr><td>Fuel Rails & Injectors</td><td>${toLabel(s.fuelRailsInjectors)}</td></tr>
          <tr><td>Wiring Harness</td><td>${toLabel(s.wiringHarness)}</td></tr>
          <tr><td>Battery Voltage Check</td><td>${toLabel(s.batteryVoltage)}</td></tr>
          <tr><td>Battery Voltage Value</td><td>${s.batteryVoltageValue ? s.batteryVoltageValue + " V" : "N/A"}</td></tr>
          <tr><td>Alternator / Starter</td><td>${toLabel(s.alternatorStarter)}</td></tr>
          <tr><td>Gear Shifting</td><td>${toLabel(s.gearShifting)}</td></tr>
          <tr><td>Gearbox Leaks</td><td>${toLabel(s.gearboxLeaks)}</td></tr>
          <tr><td>Clutch Life Percent</td><td>${s.clutchLifePercent !== undefined ? s.clutchLifePercent + "%" : "N/A"}</td></tr>
          <tr><td>Drive Shaft / Axle</td><td>${toLabel(s.driveShaftAxle)}</td></tr>
        </table>
      </div>
    `;
  }

  // 2. Mechanical
  const mech = report.mechanical || {};
  const mechanicalHTML = `
    <div class="section-card">
      <h3>Section 2: Mechanical Components</h3>
      <table class="data-table">
        <tr><td>Steering Performance</td><td>${toLabel(mech.steeringPerformance)}</td></tr>
        <tr><td>Steering Rack Leakage</td><td>${toLabel(mech.steeringRackLeakage)}</td></tr>
        <tr><td>Shocks / Struts</td><td>${toLabel(mech.shocksStruts)}</td></tr>
        <tr><td>Ball Joints & Bushes</td><td>${toLabel(mech.ballJointsBushes)}</td></tr>
        <tr><td>Suspension Noise</td><td>${toLabel(mech.suspensionNoise)}</td></tr>
        <tr><td>Disc / Drum Brake Condition</td><td>${toLabel(mech.discDrumBrakeCondition)}</td></tr>
        <tr><td>Brake Pad Life Percent</td><td>${mech.brakePadLifePercent !== undefined ? mech.brakePadLifePercent + "%" : "N/A"}</td></tr>
        <tr><td>Brake Fluid Lines</td><td>${toLabel(mech.brakeFluidLines)}</td></tr>
        ${is4W ? `<tr><td>ABS Warning Light</td><td>${toLabel(mech.absWarningLight)}</td></tr>` : ""}
      </table>
    </div>
  `;

  // 3. Panels
  const ext = report.exteriorPanels || {};
  let panelsHTML = "";
  if (ext.panels && ext.panels.length > 0) {
    panelsHTML = `
      <div class="section-card">
        <h3>Section 3: Exterior — Panel Inspection</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Panel Name</th>
              <th>Paint Status</th>
              <th>Repainted</th>
              <th>Dent</th>
              <th>Scratch</th>
              <th>Rust</th>
              <th>Photo Link</th>
            </tr>
          </thead>
          <tbody>
            ${ext.panels.map(p => `
              <tr>
                <td><strong>${escapeHtml(p.panelName)}</strong></td>
                <td>${p.originalPaint ? "Original" : "Altered"}</td>
                <td>${p.repainted ? "Yes" : "No"}</td>
                <td>${toLabel(p.dentSeverity)}</td>
                <td>${toLabel(p.scratchSeverity)}</td>
                <td>${p.rustPresent ? "Yes" : "No"}</td>
                <td>${formatVal(p.panelPhoto)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } else {
    panelsHTML = `
      <div class="section-card">
        <h3>Section 3: Exterior — Panel Inspection</h3>
        <p class="no-data">No panel details available.</p>
      </div>
    `;
  }

  // 4. Glass
  const glass = report.glassAndExteriorElectronics || {};
  const glassHTML = `
    <div class="section-card">
      <h3>Section 4: Glass & Exterior Electronics</h3>
      <table class="data-table">
        <tr><td>Glass Scratches</td><td>${toLabel(glass.glassScratches)}</td></tr>
        <tr><td>Glass Cracks / Chips</td><td>${toLabel(glass.glassCracksChips)}</td></tr>
        <tr><td>Side Mirrors</td><td>${toLabel(glass.sideMirrors)}</td></tr>
        <tr><td>Parking Sensors</td><td>${toLabel(glass.parkingSensors)}</td></tr>
        <tr><td>Exterior Lights All</td><td>${toLabel(glass.exteriorLightsAll)}</td></tr>
        <tr><td>Wipers & Washers</td><td>${toLabel(glass.wipersWashers)}</td></tr>
      </table>
    </div>
  `;

  // 5. Interior
  const cabin = report.interiorAndCabin || {};
  const cabinHTML = `
    <div class="section-card">
      <h3>Section 5: Interior & Cabin</h3>
      <table class="data-table">
        ${!isEV ? `
          <tr><td>AC Cooling / Heating</td><td>${toLabel(cabin.acCoolingHeating)}</td></tr>
          <tr><td>AC Compressor</td><td>${toLabel(cabin.acCompressor)}</td></tr>
          <tr><td>AC Gas Leakage</td><td>${toLabel(cabin.acGasLeakage)}</td></tr>
        ` : `
          <tr><td>HVAC & Climate Control</td><td>${toLabel(cabin.hvacClimateControl)}</td></tr>
        `}
        <tr><td>Speakers</td><td>${toLabel(cabin.speakers)}</td></tr>
        <tr><td>Infotainment System</td><td>${toLabel(cabin.infotainmentSystem)}</td></tr>
        <tr><td>Interior Lights</td><td>${toLabel(cabin.interiorLights)}</td></tr>
        <tr><td>Central Locking</td><td>${toLabel(cabin.centralLocking)}</td></tr>
        <tr><td>Power Windows All</td><td>${toLabel(cabin.powerWindowsAll)}</td></tr>
        <tr><td>Reverse Camera & Sensors</td><td>${toLabel(cabin.reverseCameraSensors)}</td></tr>
        <tr><td>Seat Condition</td><td>${toLabel(cabin.seatCondition)}</td></tr>
        <tr><td>Dashboard Condition</td><td>${toLabel(cabin.dashboardCondition)}</td></tr>
        <tr><td>Water / Flood Damage Signs</td><td>${toLabel(cabin.waterFloodDamageSigns)}</td></tr>
      </table>
    </div>
  `;

  // 6. Structural
  const struct = report.structuralHistory || {};
  const structuralHTML = `
    <div class="section-card">
      <h3>Section 6: Structural History</h3>
      <table class="data-table">
        <tr><td>Structural Damage</td><td>${toLabel(struct.structuralDamage)}</td></tr>
        <tr><td>Flood Damage Confirmed</td><td>${toLabel(struct.floodDamageConfirmed)}</td></tr>
        <tr><td>Underbody Condition</td><td>${toLabel(struct.underbodyCondition)}</td></tr>
        <tr><td>Chassis Alignment</td><td>${toLabel(struct.chassisAlignment)}</td></tr>
      </table>
    </div>
  `;

  // 7. Tyres
  const tyres = report.tyres || {};
  const tyresHTML = `
    <div class="section-card">
      <h3>Section 7: Tyres</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Tread Depth (mm)</th>
            <th>Tyre Age (years)</th>
            <th>Condition</th>
            <th>Tyre Photo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Front Left</strong></td>
            <td>${tyres.frontLeftTreadDepthMm !== undefined ? tyres.frontLeftTreadDepthMm + " mm" : "N/A"}</td>
            <td>${tyres.frontLeftTyreAgeYears !== undefined ? tyres.frontLeftTyreAgeYears + " years" : "N/A"}</td>
            <td>${toLabel(tyres.frontLeftTyreCondition)}</td>
            <td>${formatVal(tyres.frontLeftTyrePhoto)}</td>
          </tr>
          <tr>
            <td><strong>Front Right</strong></td>
            <td>${tyres.frontRightTreadDepthMm !== undefined ? tyres.frontRightTreadDepthMm + " mm" : "N/A"}</td>
            <td>${tyres.frontRightTyreAgeYears !== undefined ? tyres.frontRightTyreAgeYears + " years" : "N/A"}</td>
            <td>${toLabel(tyres.frontRightTyreCondition)}</td>
            <td>${formatVal(tyres.frontRightTyrePhoto)}</td>
          </tr>
          <tr>
            <td><strong>Rear Left</strong></td>
            <td>${tyres.rearLeftTreadDepthMm !== undefined ? tyres.rearLeftTreadDepthMm + " mm" : "N/A"}</td>
            <td>${tyres.rearLeftTyreAgeYears !== undefined ? tyres.rearLeftTyreAgeYears + " years" : "N/A"}</td>
            <td>${toLabel(tyres.rearLeftTyreCondition)}</td>
            <td>${formatVal(tyres.rearLeftTyrePhoto)}</td>
          </tr>
          <tr>
            <td><strong>Rear Right</strong></td>
            <td>${tyres.rearRightTreadDepthMm !== undefined ? tyres.rearRightTreadDepthMm + " mm" : "N/A"}</td>
            <td>${tyres.rearRightTyreAgeYears !== undefined ? tyres.rearRightTyreAgeYears + " years" : "N/A"}</td>
            <td>${toLabel(tyres.rearRightTyreCondition)}</td>
            <td>${formatVal(tyres.rearRightTyrePhoto)}</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Spare Tyre Condition</strong></td>
            <td colspan="2">${toLabel(tyres.spareTyreCondition)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // 8. OBD
  let obdHTML = "";
  if (!isEV) {
    const obd = report.obdDiagnostics || {};
    obdHTML = `
      <div class="section-card">
        <h3>Section 8: OBD / Diagnostics</h3>
        <table class="data-table">
          <tr><td>OBD Scan Done</td><td>${toLabel(obd.obdScanDone)}</td></tr>
          <tr><td>Error Codes Present</td><td>${formatVal(obd.errorCodesPresent)}</td></tr>
          ${obd.errorCodesPresent ? `<tr><td>Error Code Details</td><td><strong>${obd.errorCodeDetails || "N/A"}</strong></td></tr>` : ""}
          <tr><td>Emission Status</td><td>${toLabel(obd.emissionStatus)}</td></tr>
        </table>
      </div>
    `;
  }

  // 9. Modifications
  const mods = report.modifications || {};
  let modificationsHTML = "";
  if (mods.modificationsDetected) {
    modificationsHTML = `
      <div class="section-card">
        <h3>Section 9: Modification Check</h3>
        <table class="data-table">
          <tr><td>Modifications Detected</td><td>Yes</td></tr>
          <tr><td>Modification Count</td><td>${mods.modificationCount || 0}</td></tr>
          <tr><td>Overall Modification Risk Level</td><td>${toLabel(mods.modificationRiskLevel)}</td></tr>
          <tr><td>Seller Declaration Match</td><td>${mods.sellerDeclarationMatch ? "Yes" : "No"}</td></tr>
        </table>
        
        <h4>Modification Items</h4>
        <table class="data-table" style="margin-top: 10px;">
          <thead>
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>OEM</th>
              <th>Warranty Impact</th>
              <th>Safety Impact</th>
              <th>Remarks</th>
              <th>Photo Link</th>
            </tr>
          </thead>
          <tbody>
            ${(mods.modificationItems || []).map(m => `
              <tr>
                <td><strong>${toLabel(m.modificationCategory)}</strong></td>
                <td>${toLabel(m.modificationType)}</td>
                <td>${m.isOem ? "Yes" : "No"}</td>
                <td>${toLabel(m.impactOnWarranty)}</td>
                <td>${toLabel(m.impactOnSafety)}</td>
                <td>${escapeHtml(m.remarks) || "N/A"}</td>
                <td>${formatVal(m.photo)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } else {
    modificationsHTML = `
      <div class="section-card">
        <h3>Section 9: Modification Check</h3>
        <table class="data-table">
          <tr><td>Modifications Detected</td><td>No modifications detected.</td></tr>
        </table>
      </div>
    `;
  }

  // 10. Media Section
  const media = report.media || {};
  const mediaHTML = `
    <div class="section-card">
      <h3>Section 10: Media & Documentation</h3>
      <table class="data-table">
        <tr><td>Engine or Motor Running Video</td><td>${formatVal(media.engineOrMotorRunningVideo)}</td></tr>
        <tr><td>Test Drive Video</td><td>${formatVal(media.testDriveVideo)}</td></tr>
        <tr>
          <td>Underbody Photos</td>
          <td>
            ${media.underbodyPhotos && media.underbodyPhotos.length > 0
              ? media.underbodyPhotos.map((url, i) => `<div style="margin-bottom: 5px;">${formatVal(url)}</div>`).join("")
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Major Dent Photos</td>
          <td>
            ${media.majorDentPhotos && media.majorDentPhotos.length > 0
              ? media.majorDentPhotos.map((url, i) => `<div style="margin-bottom: 5px;">${formatVal(url)}</div>`).join("")
              : "None"}
          </td>
        </tr>
      </table>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vehicle Inspection Report</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1F2937;
          margin: 0;
          padding: 20px;
          background-color: #ffffff;
        }
        .header-container {
          border-bottom: 3px solid #007BFF;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .header-container h1 {
          color: #007BFF;
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .header-container p {
          margin: 5px 0 0 0;
          color: #6B7280;
          font-size: 14px;
        }
        .summary-box {
          background-color: #F3F4F6;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 25px;
          border-left: 5px solid #007BFF;
        }
        .summary-box h2 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #111827;
        }
        .summary-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 10px;
          margin-top: 10px;
        }
        .summary-item {
          background: #ffffff;
          padding: 10px 15px;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
        }
        .summary-item .label {
          font-size: 12px;
          color: #9CA3AF;
          text-transform: uppercase;
          margin-bottom: 3px;
          font-weight: 600;
        }
        .summary-item .value {
          font-size: 16px;
          color: #111827;
          font-weight: 700;
        }
        .section-card {
          margin-bottom: 30px;
        }
        .section-card h3 {
          color: #007BFF;
          font-size: 18px;
          margin: 0 0 12px 0;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 5px;
          font-weight: 700;
        }
        .section-card h4 {
          color: #374151;
          font-size: 14px;
          margin: 15px 0 8px 0;
          font-weight: 700;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .data-table th, .data-table td {
          border: 1px solid #E5E7EB;
          padding: 10px 12px;
          text-align: left;
          font-size: 13px;
        }
        .data-table th {
          background-color: #F9FAFB;
          color: #374151;
          font-weight: 700;
        }
        .data-table tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .data-table td:first-child {
          font-weight: 500;
          color: #4B5563;
          width: 40%;
        }
        .no-data {
          font-style: italic;
          color: #9CA3AF;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #9CA3AF;
          border-top: 1px solid #E5E7EB;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <h1>Vehicle Inspection Report</h1>
        <p>Generated by Reecomm Inspection App • Active Inspector: ${escapeHtml(report.inspectorName) || "N/A"}</p>
      </div>

      <div class="summary-box">
        <h2>${escapeHtml(report.makerName)} ${escapeHtml(report.modelName)} (${escapeHtml(report.yearOfMfg) || "N/A"})</h2>
        <table class="summary-table">
          <tr>
            <td>
              <div class="summary-item">
                <div class="label">Vehicle Category</div>
                <div class="value">${escapeHtml(report.vehicleSubType) || "N/A"} (${escapeHtml(report.fuelType)})</div>
              </div>
            </td>
            <td>
              <div class="summary-item">
                <div class="label">Inspection Score</div>
                <div class="value" style="color: #007BFF;">${report.inspectionScore?.toFixed(1) || "0.0"} / 5.0</div>
              </div>
            </td>
            <td>
              <div class="summary-item">
                <div class="label">Checkpoints Passed</div>
                <div class="value" style="color: #16A34A;">${report.passedCheckpoints} / ${report.totalCheckpoints}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="summary-item">
                <div class="label">Overall Risk Level</div>
                <div class="value" style="color: ${report.overallRiskLevel === "High" ? "#EF4444" : "#F59E0B"};">${escapeHtml(report.overallRiskLevel) || "N/A"}</div>
              </div>
            </td>
            <td>
              <div class="summary-item">
                <div class="label">Inspection Date</div>
                <div class="value">${report.inspectionSubmittedAt ? new Date(report.inspectionSubmittedAt).toLocaleDateString() : "N/A"}</div>
              </div>
            </td>
            <td>
              <div class="summary-item">
                <div class="label">Report Status</div>
                <div class="value">${escapeHtml(report.reportStatus) || "SUBMITTED"}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      ${engineHTML}
      ${mechanicalHTML}
      ${panelsHTML}
      ${glassHTML}
      ${cabinHTML}
      ${structuralHTML}
      ${tyresHTML}
      ${obdHTML}
      ${modificationsHTML}
      ${mediaHTML}

      <div class="footer">
        <p>© ${new Date().getFullYear()} Reecomm Infotech. All rights reserved. This document is confidential.</p>
      </div>
    </body>
    </html>
  `;
};
