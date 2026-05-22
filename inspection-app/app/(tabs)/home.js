import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { inspectionAPI } from "../../services/api/inspectionAPI";
import { apiService } from "../../services/api/api";
import { COLORS } from "../../constants";
import ThemeBackground from "../../components/ThemeBackground";

export default function HomeTab() {
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    ongoing: 0,
    completed: 0,
    revenue: "0",
  });

  // Action states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // User profile states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    loadData();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 1. Try cached data first
      const cached = await apiService.getUserData();
      if (cached) {
        setFirstName(cached.firstname || "");
        setLastName(cached.lastname || "");
      }

      // 2. Refresh from API
      const fresh = await apiService.get("/api/v1/website/vehicle/inspector/profile");
      if (fresh?.data) {
        const profile = fresh.data;
        setFirstName(profile.firstname || "");
        setLastName(profile.lastname || "");
        await apiService.setUserData(profile);
      }
    } catch (error) {
      console.log("Error loading user profile in home:", error);
    }
  };

  const loadData = async () => {
    try {
      // 1. Fetch recent 3 pending inspections
      const pendingRes = await inspectionAPI.getAssignedInspections(1, 3, "ASSIGNED");
      if (pendingRes?.data) {
        setInspections(pendingRes.data);
      }

      // 2. Fetch stats counts
      const [pRes, oRes, cRes] = await Promise.all([
        inspectionAPI.getAssignedInspections(1, 1, "ASSIGNED"),
        inspectionAPI.getAssignedInspections(1, 1, "IN_PROGRESS"),
        inspectionAPI.getAssignedInspections(1, 1, "COMPLETED"),
      ]);

      setStats({
        pending: pRes?.pageResponse?.totalElements || 0,
        ongoing: oRes?.pageResponse?.totalElements || 0,
        completed: cRes?.pageResponse?.totalElements || 0,
        revenue: "₹0", // Revenue still mock for now as API doesn't provide it
      });
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  };

  const handleAccept = async (id) => {
    try {
      setSubmitting(true);
      await inspectionAPI.acceptAssignment(id);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Inspection accepted successfully!",
        position: "top",
        visibilityTime: 2000,
      });
      loadData(); // Refresh list and stats
    } catch (error) {
      Alert.alert("Error", "Failed to accept inspection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectPress = (id) => {
    setSelectedInspectionId(id);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Required", "Please enter a reason for rejection.");
      return;
    }
    try {
      setSubmitting(true);
      await inspectionAPI.reject(selectedInspectionId, rejectReason.trim());
      setRejectModalVisible(false);
      setRejectReason("");
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Inspection rejected.",
        position: "top",
        visibilityTime: 2000,
      });
      loadData();
    } catch (error) {
      Alert.alert("Error", "Failed to reject inspection.");
    } finally {
      setSubmitting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Stats are now in the stats state
  const { pending: pendingCount, ongoing: ongoingCount, completed: completedCount, revenue: revenueAmount } = stats;

  // Recent inspections are already fetched as size=3
  const recentInspections = inspections;

  const getInspectionTypeColor = (type) => {
    const t = type?.toUpperCase() || "";
    if (t.includes("CONSULTANT") || t.includes("CONSULTATION"))
      return { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA" };
    if (t.includes("SELLER"))
      return { bg: "rgba(244, 63, 94, 0.15)", text: "#F43F5E" };
    if (t.includes("BUYER") || t.includes("VIDEO"))
      return { bg: "rgba(99, 102, 241, 0.15)", text: "#818CF8" };
    return { bg: "rgba(255, 255, 255, 0.08)", text: "#9CA3AF" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "ASSIGNED":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", icon: "time-outline" };
      case "IN_PROGRESS":
      case "ONGOING":
      case "ACCEPTED":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA", icon: "car-sport" };
      case "COMPLETED":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", icon: "checkmark-circle" };
      case "REJECTED":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", icon: "close-circle" };
      default:
        return { bg: "rgba(255, 255, 255, 0.08)", text: "#9CA3AF", icon: "help-circle" };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderInspectionCard = (item) => {
    const typeColor = getInspectionTypeColor(item.inspectionType);
    const statusColor = getStatusColor(item.assignmentStatus);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.inspectionCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/inspection-details?id=${item.id}`)}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text style={styles.cardTitle}>{item.makerName} {item.modelName}</Text>
            <Text style={styles.cardNumber}>{item.regNumber}</Text>
          </View>
          <View style={[styles.pendingBadge, { backgroundColor: statusColor.bg }]}>
            <Ionicons name={statusColor.icon} size={12} color={statusColor.text} />
            <Text style={[styles.pendingText, { color: statusColor.text }]}>
              {item.assignmentStatus?.toUpperCase() === "ACCEPTED" 
                ? "IN PROGRESS" 
                : item.assignmentStatus?.replace(/_/g, " ") || "Pending"}
            </Text>
          </View>
        </View>

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
          <Ionicons
            name="document-text-outline"
            size={10}
            color={typeColor.text}
          />
          <Text style={[styles.typeText, { color: typeColor.text }]}>
            {item.inspectionType?.replace(/_/g, " ")}
          </Text>
        </View>

        {/* Details */}
        <View className="flex-row items-center mt-2">
          <Ionicons name="person-outline" size={14} color="#9CA3AF" />
          <Text style={styles.cardDetail}>{item.ownerFirstname} {item.ownerLastname}</Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={14} color="#9CA3AF" />
          <Text style={styles.cardDetail} numberOfLines={1}>
            {item.cityName}, {item.stateName}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.cardDetail}>{formatDate(item.scheduledAt)}</Text>
          <Ionicons
            name="time-outline"
            size={14}
            color="#9CA3AF"
            style={{ marginLeft: 12 }}
          />
          <Text style={styles.cardDetail}>{formatTime(item.scheduledAt)}</Text>
        </View>

        {/* Action Buttons */}
        {item.assignmentStatus === "ASSIGNED" && (
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.cardRejectButton} 
              onPress={() => handleRejectPress(item.id)}
            >
              <Text style={styles.cardRejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cardAcceptButton} 
              onPress={() => handleAccept(item.id)}
            >
              <Text style={styles.cardAcceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemeBackground style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.fourth]}
            tintColor={COLORS.fourth}
          />
        }
      >
        {/* Stylish Greeting */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingCard}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <View style={styles.brandContainer}>
              <Text style={styles.brandTextPrimary}>{firstName || "Inspector"}</Text>
              {lastName ? (
                <Text style={styles.brandTextSecondary}>{lastName}</Text>
              ) : null}
            </View>
            <View style={styles.decorativeLine} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Pending */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <View style={[styles.statIconContainer, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Ionicons name="timer-outline" size={22} color="#F59E0B" />
              </View>
            </View>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statNumber}>{pendingCount}</Text>
          </View>

          {/* On Going */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <View style={[styles.statIconContainer, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                <Ionicons name="car-sport-outline" size={22} color="#3B82F6" />
              </View>
            </View>
            <Text style={styles.statLabel}>On Going</Text>
            <Text style={styles.statNumber}>{ongoingCount}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {/* Completed */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <View style={[styles.statIconContainer, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#10B981" />
              </View>
            </View>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statNumber}>{completedCount}</Text>
          </View>

          {/* Total Revenue */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <View style={[styles.statIconContainer, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
                <Ionicons name="wallet-outline" size={22} color="#8B5CF6" />
              </View>
            </View>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statNumber}>{revenueAmount}</Text>
          </View>
        </View>

        {/* Recent Inspections Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <TouchableOpacity onPress={() => router.push("/inspections")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Inspection Cards */}
        <View style={styles.recentInspections}>
          {recentInspections.length > 0 ? (
            recentInspections.map((item) => renderInspectionCard(item))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No pending inspections</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reject Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Inspection</Text>
            <Text style={styles.modalLabel}>Reason for Rejection</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View className="flex-row mt-4">
              <TouchableOpacity style={styles.modalCancel} onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleRejectConfirm} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalConfirmText}>Confirm Reject</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.secondary, marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: "600", color: COLORS.secondary, marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)", color: "#FFFFFF", borderRadius: 12, padding: 12, fontSize: 15, height: 100, textAlignVertical: "top" },
  modalCancel: { flex: 1, height: 48, justifyContent: "center", alignItems: "center" },
  modalCancelText: { fontSize: 16, fontWeight: "bold", color: COLORS.gray600 },
  modalConfirm: { flex: 2, height: 48, backgroundColor: COLORS.danger, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  modalConfirmText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  
  // Card Actions
  cardActions: { flexDirection: "row", marginTop: 12, gap: 10 },
  cardRejectButton: { flex: 1, height: 36, backgroundColor: "rgba(255, 255, 255, 0.06)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardRejectButtonText: { color: COLORS.gray900, fontSize: 13, fontWeight: "600" },
  cardAcceptButton: { flex: 1, height: 36, backgroundColor: COLORS.fourth, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardAcceptButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

  container: {
    flex: 1,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greetingCard: {
    // backgroundColor: "rgba(255, 255, 255, 0.03)",
    // borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.08)",
    // borderRadius: 24,
    paddingLeft: 10,
    paddingBottom: 10,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.third,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  brandContainer: {
    flexDirection: "row",
    columnGap: 10,
  },
  brandTextPrimary: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.secondary,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  brandTextSecondary: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.fourth,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.warning,
    borderRadius: 2,
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.third,
    fontWeight: "600",
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.fourth,
  },
  recentInspections: {
    paddingHorizontal: 16,
  },
  inspectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.fourth,
    marginTop: 2,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: COLORS.third,
    marginLeft: 6,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.third,
    marginTop: 12,
  },
});
