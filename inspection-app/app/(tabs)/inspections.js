import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { inspectionAPI } from "../../services/api/inspectionAPI";

export default function InspectionsTab() {
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Animated values for scroll indicator
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [scrollMetrics, setScrollMetrics] = useState({
    contentWidth: 0,
    layoutWidth: 0,
  });

  // Status mapping for API
  const statusMap = {
    pending: "ASSIGNED",
    accepted: "ACCEPTED",
    ongoing: "IN_PROGRESS",
    submitted: "SUBMITTED",
    completed: "COMPLETED",
    rejected: "REJECTED",
  };

  // Refresh when tab changes OR when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInspections(1, true);
      loadTabCounts();
    }, [activeTab])
  );

  const loadInspections = async (page = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setPageNo(1);
      } else {
        setLoadingMore(true);
      }

      const response = await inspectionAPI.getAssignedInspections(
        page,
        10,
        statusMap[activeTab],
      );

      if (response?.data) {
        if (isInitial) {
          setInspections(response.data);
        } else {
          setInspections((prev) => [...prev, ...response.data]);
        }

        const { currentPage, totalPages } = response.pageResponse || {};
        setHasMore(currentPage < totalPages);
        setPageNo(page);
      }
    } catch (error) {
      console.error("Error loading inspections:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInspections(1, true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      loadInspections(pageNo + 1);
    }
  };

  const handleAccept = async (id) => {
    try {
      setSubmittingId(id);
      await inspectionAPI.acceptAssignment(id);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Inspection accepted successfully!",
        position: "top",
        visibilityTime: 2000,
      });
      loadInspections(1, true); // Refresh list
      loadTabCounts(); // Refresh counts
    } catch (error) {
      Alert.alert("Error", "Failed to accept inspection.");
    } finally {
      setSubmittingId(null);
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
      setSubmittingId(selectedInspectionId);
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
      loadInspections(1, true);
      loadTabCounts();
    } catch (error) {
      Alert.alert("Error", "Failed to reject inspection.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleStartInspection = async (item) => {
    const isAccepted = item.assignmentStatus?.toUpperCase() === "ACCEPTED";
    
    try {
      setSubmittingId(item.id);
      
      // Only call START api if the status is ACCEPTED
      if (isAccepted) {
        const t = (item.vehicleType || "").toUpperCase();
        const cat = (t.includes("TWO") || t === "2W" || t.includes("2")) ? "2W" : "4W";
        if (cat === "2W") {
          await inspectionAPI.startInspection2W(item.id);
        } else {
          await inspectionAPI.startInspection(item.id);
        }
      }
      
      // Navigate to the start inspection screen
      router.push(
        `/start-inspection?id=${item.id}` +
        `&vehicleCategory=${encodeURIComponent(item.vehicleType || "")}` +
        `&vehicleSubtype=${encodeURIComponent(item.vehicleSubType || "")}` +
        `&fuelType=${encodeURIComponent(item.fuelType || "")}` +
        `&makerName=${encodeURIComponent(item.makerName || "")}` +
        `&modelName=${encodeURIComponent(item.modelName || "")}` +
        `&regNumber=${encodeURIComponent(item.regNumber || "")}`
      );
    } catch (error) {
      console.error("Error starting inspection:", error);
      Alert.alert("Error", "Failed to start inspection. Please try again.");
    } finally {
      setSubmittingId(null);
    }
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

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    accepted: 0,
    ongoing: 0,
    submitted: 0,
    completed: 0,
    rejected: 0,
  });

  const loadTabCounts = async () => {
    try {
      const [pRes, aRes, oRes, sRes, cRes, rRes] = await Promise.all([
        inspectionAPI.getAssignedInspections(1, 1, "ASSIGNED"),
        inspectionAPI.getAssignedInspections(1, 1, "ACCEPTED"),
        inspectionAPI.getAssignedInspections(1, 1, "IN_PROGRESS"),
        inspectionAPI.getAssignedInspections(1, 1, "SUBMITTED"),
        inspectionAPI.getAssignedInspections(1, 1, "COMPLETED"),
        inspectionAPI.getAssignedInspections(1, 1, "REJECTED"),
      ]);

      setTabCounts({
        pending: pRes?.pageResponse?.totalElements || 0,
        accepted: aRes?.pageResponse?.totalElements || 0,
        ongoing: oRes?.pageResponse?.totalElements || 0,
        submitted: sRes?.pageResponse?.totalElements || 0,
        completed: cRes?.pageResponse?.totalElements || 0,
        rejected: rRes?.pageResponse?.totalElements || 0,
      });
    } catch (error) {
      console.log("Error loading tab counts:", error);
    }
  };

  const { 
    pending: pendingCount, 
    accepted: acceptedCount, 
    ongoing: ongoingCount, 
    submitted: submittedCount, 
    completed: completedCount, 
    rejected: rejectedCount 
  } = tabCounts;

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return { bg: "#DCFCE7", text: "#166534", icon: "checkmark-circle" };
      case "assigned":
      case "pending":
        return { bg: "#FEF3C7", text: "#92400E", icon: "time-outline" };
      case "accepted":
        return { bg: "#EFF6FF", text: "#1E56A0", icon: "checkmark-done" };
      case "in_progress":
      case "ongoing":
        return { bg: "#DBEAFE", text: "#1E40AF", icon: "car-sport" };
      case "submitted":
        return { bg: "#F0FDF4", text: "#15803D", icon: "send-outline" };
      case "rejected":
        return { bg: "#FEE2E2", text: "#991B1B", icon: "close-circle" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280", icon: "help-circle" };
    }
  };

  const getInspectionTypeColor = (type) => {
    const t = type?.toUpperCase() || "";
    if (t.includes("CONSULTANT") || t.includes("CONSULTATION"))
      return { bg: "#DBEAFE", text: "#1E40AF" };
    if (t.includes("SELLER"))
      return { bg: "#FCE7F3", text: "#9F1239" };
    if (t.includes("BUYER") || t.includes("VIDEO"))
      return { bg: "#E0E7FF", text: "#3730A3" };
    return { bg: "#F3F4F6", text: "#6B7280" };
  };

  const renderInspection = ({ item }) => {
    // Map API status to UI status mapping for colors
    const uiStatus = item.assignmentStatus?.toLowerCase() || "pending";
    const statusColor = getStatusColor(uiStatus);
    const typeColor = getInspectionTypeColor(item.inspectionType);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/inspection-details?id=${item.id}`)}
      >
        {/* Header with Car Model and Status */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="font-bold" style={styles.carModel}>
              {item.makerName} {item.modelName}
            </Text>
            <Text className="font-semibold mt-1" style={styles.carNumber}>
              {item.regNumber}
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
          >
            <Ionicons
              name={statusColor.icon}
              size={14}
              color={statusColor.text}
            />
            <Text
              className="ml-1 font-semibold capitalize"
              style={[styles.statusText, { color: statusColor.text }]}
            >
              {item.assignmentStatus?.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Inspection Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
          <Ionicons
            name="document-text-outline"
            size={12}
            color={typeColor.text}
          />
          <Text
            className="ml-1 font-medium"
            style={[styles.typeText, { color: typeColor.text }]}
          >
            {item.inspectionType?.replace(/_/g, " ")}
          </Text>
        </View>
        {/* Info Rows */}
        <View className="mt-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text className="ml-2" style={styles.cardDetail}>
              {item.ownerFirstname} {item.ownerLastname}
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="ml-2" style={styles.cardDetail} numberOfLines={1}>
              {item.cityName}, {item.stateName}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="ml-2" style={styles.cardDetail}>
              {formatDate(item.scheduledAt)} • {formatTime(item.scheduledAt)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {item.assignmentStatus === "ASSIGNED" && (
            <>
              <TouchableOpacity 
                style={styles.cardRejectButton} 
                onPress={() => handleRejectPress(item.id)}
              >
                <Text style={styles.cardRejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.cardAcceptButton, submittingId === item.id && { opacity: 0.7 }]} 
                onPress={() => handleAccept(item.id)}
                disabled={submittingId !== null}
              >
                {submittingId === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.cardAcceptButtonText}>Accept</Text>
                )}
              </TouchableOpacity>
            </>
          )}
          
          {((item.assignmentStatus?.toUpperCase() === "IN_PROGRESS") || (item.assignmentStatus?.toUpperCase() === "ACCEPTED")) && (
            <>
              <TouchableOpacity 
                style={styles.cardRejectButton} 
                onPress={() => handleRejectPress(item.id)}
              >
                <Text style={styles.cardRejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.cardAcceptButton, submittingId === item.id && { opacity: 0.7 }]} 
                onPress={() => handleStartInspection(item)}
                disabled={submittingId !== null}
              >
                {submittingId === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.cardAcceptButtonText}>
                    {item.assignmentStatus?.toUpperCase() === "IN_PROGRESS" ? "Continue to Inspection" : "Start Inspection"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {(item.assignmentStatus === "COMPLETED" || item.assignmentStatus === "SUBMITTED") && (
            <TouchableOpacity 
              style={[styles.cardAcceptButton, { backgroundColor: "#1E56A0" }]} 
              onPress={() => router.push(
                `/inspection-report?id=${item.id}` +
                `&vehicleCategory=${encodeURIComponent(item.vehicleType || "")}` +
                `&vehicleSubtype=${encodeURIComponent(item.vehicleSubType || "")}` +
                `&fuelType=${encodeURIComponent(item.fuelType || "")}` +
                `&makerName=${encodeURIComponent(item.makerName || "")}` +
                `&modelName=${encodeURIComponent(item.modelName || "")}` +
                `&regNumber=${encodeURIComponent(item.regNumber || "")}`
              )}
            >
              <Text style={styles.cardAcceptButtonText}>View Report</Text>
            </TouchableOpacity>
          )}

          {(item.assignmentStatus === "REJECTED") && (
            <TouchableOpacity 
              style={[styles.cardAcceptButton, { backgroundColor: "#F3F4F6" }]} 
              onPress={() => router.push(`/inspection-details?id=${item.id}`)}
            >
              <Text style={[styles.cardAcceptButtonText, { color: "#4B5563" }]}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rejection Reason (if rejected) */}
        {activeTab === "rejected" && item.assignmentStatus === "REJECTED" && (
          <View
            className="mt-3 flex-row items-start"
            style={styles.rejectionBox}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text className="ml-2 flex-1" style={styles.rejectionText}>
              {item.rejectionReason || "No reason provided"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    // Calculate proper ranges based on actual scroll dimensions
    const maxScrollDistance = Math.max(
      scrollMetrics.contentWidth - scrollMetrics.layoutWidth,
      1,
    );
    const indicatorWidth = 120;
    const trackWidth = scrollMetrics.layoutWidth || 350; // Fallback width
    const maxIndicatorTravel = trackWidth - indicatorWidth; // Full track minus indicator width

    // Calculate indicator position based on scroll
    const indicatorPosition = scrollX.interpolate({
      inputRange: [0, maxScrollDistance],
      outputRange: [0, maxIndicatorTravel],
      extrapolate: "clamp",
    });

    return (
      <View>
        {/* Tabs - Horizontal Scrollable */}
        <View style={styles.tabsWrapper}>
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScrollView}
            contentContainerStyle={styles.tabsScrollContainer}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            onContentSizeChange={(contentWidth, contentHeight) => {
              setScrollMetrics((prev) => ({ ...prev, contentWidth }));
            }}
            onLayout={(event) => {
              const layoutWidth = event.nativeEvent.layout.width;
              setScrollMetrics((prev) => ({ ...prev, layoutWidth }));
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("pending")}
              style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            >
              <Text
                className="font-semibold"
                style={[
                  styles.tabText,
                  activeTab === "pending" && styles.activeTabText,
                ]}
              >
                Pending
              </Text>
              {pendingCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === "pending" && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === "pending" && styles.activeBadgeText,
                    ]}
                  >
                    {pendingCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("accepted")}
              style={[styles.tab, activeTab === "accepted" && styles.activeTab]}
            >
              <Text
                className="font-semibold"
                style={[
                  styles.tabText,
                  activeTab === "accepted" && styles.activeTabText,
                ]}
              >
                Accepted
              </Text>
              {acceptedCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === "accepted" && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === "accepted" && styles.activeBadgeText,
                    ]}
                  >
                    {acceptedCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("ongoing")}
              style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
            >
              <Text
                className="font-semibold"
                style={[
                  styles.tabText,
                  activeTab === "ongoing" && styles.activeTabText,
                ]}
              >
                In Progress
              </Text>
              {ongoingCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === "ongoing" && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === "ongoing" && styles.activeBadgeText,
                    ]}
                  >
                    {ongoingCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("submitted")}
              style={[styles.tab, activeTab === "submitted" && styles.activeTab]}
            >
              <Text
                className="font-semibold"
                style={[
                  styles.tabText,
                  activeTab === "submitted" && styles.activeTabText,
                ]}
              >
                Submitted
              </Text>
              {submittedCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === "submitted" && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === "submitted" && styles.activeBadgeText,
                    ]}
                  >
                    {submittedCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("completed")}
              style={[
                styles.tab,
                activeTab === "completed" && styles.activeTab,
              ]}
            >
              <Text
                className="font-semibold"
                style={[
                  styles.tabText,
                  activeTab === "completed" && styles.activeTabText,
                ]}
              >
                Completed
              </Text>
              {completedCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === "completed" && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === "completed" && styles.activeBadgeText,
                    ]}
                  >
                    {completedCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("rejected")}
              style={[styles.tab, activeTab === "rejected" && styles.activeTab]}
            >
              <Text
                className="font-semibold"
                style={[
                  styles.tabText,
                  activeTab === "rejected" && styles.activeTabText,
                ]}
              >
                Rejected
              </Text>
              {rejectedCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === "rejected" && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === "rejected" && styles.activeBadgeText,
                    ]}
                  >
                    {rejectedCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.ScrollView>
        </View>

        {/* Custom Scroll Indicator - Animated */}
        <View style={styles.scrollIndicatorContainer}>
          <View style={styles.scrollIndicatorTrack}>
            <Animated.View
              style={[
                styles.scrollIndicatorThumb,
                {
                  transform: [{ translateX: indicatorPosition }],
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  // Memoize header to prevent re-renders
  const headerComponent = useMemo(
    () => renderHeader(),
    [
      activeTab,
      pendingCount,
      ongoingCount,
      completedCount,
      rejectedCount,
      scrollMetrics,
    ],
  );

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={styles.container}
      >
        <Ionicons name="car-sport-outline" size={48} color="#9CA3AF" />
        <Text className="mt-4" style={styles.loadingText}>
          Loading inspections...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={styles.container}>
      <FlatList
        data={inspections}
        renderItem={renderInspection}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator color="#1E56A0" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E56A0"]}
            tintColor="#1E56A0"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View
              className="items-center justify-center"
              style={styles.emptyContainer}
            >
              <Ionicons name="car-outline" size={64} color="#D1D5DB" />
              <Text className="mt-4 font-semibold" style={styles.emptyTitle}>
                No {activeTab} inspections
              </Text>
              <Text className="mt-2 text-center" style={styles.emptyText}>
                There are no {activeTab} car inspections at the moment
              </Text>
            </View>
          ) : null
        }
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, fontSize: 15, height: 100, textAlignVertical: "top" },
  modalCancel: { flex: 1, height: 48, justifyContent: "center", alignItems: "center" },
  modalCancelText: { fontSize: 16, fontWeight: "bold", color: "#6B7280" },
  modalConfirm: { flex: 2, height: 48, backgroundColor: "#DC2626", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  modalConfirmText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  // Card Actions
  cardActions: { flexDirection: "row", marginTop: 12, gap: 10 },
  cardRejectButton: { flex: 1, height: 36, backgroundColor: "#F3F4F6", borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardRejectButtonText: { color: "#4B5563", fontSize: 13, fontWeight: "600" },
  cardAcceptButton: { flex: 1, height: 36, backgroundColor: "#1E56A0", borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardAcceptButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  container: {
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  tabsWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  tabsScrollView: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabsScrollContainer: {
    padding: 4,
  },
  scrollIndicatorContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  scrollIndicatorTrack: {
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  scrollIndicatorThumb: {
    height: 3,
    width: 120,
    backgroundColor: "#1E56A0",
    borderRadius: 2,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#1E56A0",
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
  },
  activeTabText: {
    color: "#fff",
  },
  badge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
  },
  activeBadgeText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  carModel: {
    fontSize: 17,
    color: "#111827",
  },
  carNumber: {
    fontSize: 14,
    color: "#1E56A0",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
  rejectionBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  rejectionText: {
    fontSize: 12,
    color: "#991B1B",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#374151",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
