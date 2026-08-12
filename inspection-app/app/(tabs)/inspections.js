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
  Linking,
  Platform,
  Image,
} from "react-native";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { inspectionAPI } from "../../services/api/inspectionAPI";
import { populateInspectionStorage } from "../../utils/reportMapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants";
import ThemeBackground from "../../components/ThemeBackground";

const LoadingImage = ({ uri, style, ...props }) => {
  const [imageLoading, setImageLoading] = useState(false);
  return (
    <View style={style}>
      <Image
        source={{ uri }}
        style={[style, { position: "absolute", top: 0, left: 0 }]}
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        {...props}
      />
      {imageLoading && (
        <View style={[style, { justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
          <ActivityIndicator size="small" color={COLORS.fourth} />
        </View>
      )}
    </View>
  );
};

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
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [activeItemForVideo, setActiveItemForVideo] = useState(null);
  const [preVideoModalVisible, setPreVideoModalVisible] = useState(false);
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
    request_changes: "REQUEST_CHANGES",
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
        setInspections([]);
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

  const openWhatsApp = (phone) => {
    if (!phone) {
      Alert.alert("Required", "No WhatsApp number is available for this vehicle owner.");
      return;
    }
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }
    const url = `whatsapp://send?phone=${cleaned}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://wa.me/${cleaned}`);
        }
      })
      .catch((err) => {
        console.error("Failed to open WhatsApp:", err);
        Alert.alert("Error", "Could not launch WhatsApp. Please make sure WhatsApp is installed.");
      });
  };

  const handlePhoneCall = (item) => {
    const phone = item.whatsappNumber;
    if (!phone) {
      Alert.alert("No Number", "No phone number is available for this inspection.");
      return;
    }
    let cleaned = phone.replace(/[^0-9+]/g, "");
    if (cleaned.length === 10) cleaned = "+91" + cleaned;
    const url = `tel:${cleaned}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) return Linking.openURL(url);
        Alert.alert("Error", "Phone calls are not supported on this device.");
      })
      .catch(() => Alert.alert("Error", "Could not initiate the call."));
  };

  const navigateToInspectionForm = (item) => {
    router.push(
      `/start-inspection?id=${item.id}` +
      `&vehicleCategory=${encodeURIComponent(item.vehicleType || "")}` +
      `&vehicleSubtype=${encodeURIComponent(item.vehicleSubType || "")}` +
      `&fuelType=${encodeURIComponent(item.fuelType || "")}` +
      `&makerName=${encodeURIComponent(item.makerName || "")}` +
      `&modelName=${encodeURIComponent(item.modelName || "")}` +
      `&regNumber=${encodeURIComponent(item.regNumber || "")}` +
      `&thumbnailUrl=${encodeURIComponent(item.thumbnailUrl || "")}`
    );
  };

  const handleStartInspection = async (item) => {
    const isAccepted = item.assignmentStatus?.toUpperCase() === "ACCEPTED";
    const isRequestChanges = item.assignmentStatus?.toUpperCase() === "REQUEST_CHANGES";

    try {
      setSubmittingId(item.id);

      const t = (item.vehicleType || "").toUpperCase();
      const cat = (t.includes("TWO") || t === "2W" || t.includes("2")) ? "2W" : "4W";

      // Only call START api if the status is ACCEPTED
      if (isAccepted) {
        if (cat === "2W") {
          await inspectionAPI.startInspection2W(item.id);
        } else {
          await inspectionAPI.startInspection(item.id);
        }
      }

      // Pre-populate AsyncStorage if editing an inspection under REQUEST_CHANGES
      if (isRequestChanges) {
        try {
          await populateInspectionStorage(inspectionAPI, item.id, cat, item.fuelType);
        } catch (populateErr) {
          console.error("AsyncStorage populate error:", populateErr);
          Alert.alert("Error", "Failed to load prefilled inspection report details. Starting with a blank form.");
        }
      }

      const isVideoCall = item.inspectionType?.toUpperCase().includes("VIDEO");

      if (isVideoCall) {
        const completedVal = await AsyncStorage.getItem(`inspection_${item.id}_video_completed`);
        if (completedVal === "true") {
          navigateToInspectionForm(item);
        } else {
          let fullDetails = item;
          const rawPhone = item.whatsappNumber || item.ownerPhone || item.phone;
          if (!rawPhone) {
            try {
              fullDetails = await inspectionAPI.getAssignedInspectionById(item.id);
            } catch (fetchErr) {
              console.error("Error fetching inspection details for whatsapp:", fetchErr);
            }
          }

          const phone = fullDetails?.whatsappNumber || fullDetails?.ownerPhone || fullDetails?.phone || rawPhone;
          setActiveItemForVideo(fullDetails);
          setPreVideoModalVisible(true);
        }
      } else {
        navigateToInspectionForm(item);
      }
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
    request_changes: 0,
  });

  const loadTabCounts = async () => {
    try {
      const [pRes, aRes, oRes, sRes, cRes, rRes, rcRes] = await Promise.all([
        inspectionAPI.getAssignedInspections(1, 1, "ASSIGNED"),
        inspectionAPI.getAssignedInspections(1, 1, "ACCEPTED"),
        inspectionAPI.getAssignedInspections(1, 1, "IN_PROGRESS"),
        inspectionAPI.getAssignedInspections(1, 1, "SUBMITTED"),
        inspectionAPI.getAssignedInspections(1, 1, "COMPLETED"),
        inspectionAPI.getAssignedInspections(1, 1, "REJECTED"),
        inspectionAPI.getAssignedInspections(1, 1, "REQUEST_CHANGES"),
      ]);

      setTabCounts({
        pending: pRes?.pageResponse?.totalElements || 0,
        accepted: aRes?.pageResponse?.totalElements || 0,
        ongoing: oRes?.pageResponse?.totalElements || 0,
        submitted: sRes?.pageResponse?.totalElements || 0,
        completed: cRes?.pageResponse?.totalElements || 0,
        rejected: rRes?.pageResponse?.totalElements || 0,
        request_changes: rcRes?.pageResponse?.totalElements || 0,
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
    rejected: rejectedCount,
    request_changes: requestChangesCount
  } = tabCounts;

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", icon: "checkmark-circle" };
      case "assigned":
      case "pending":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", icon: "time-outline" };
      case "accepted":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA", icon: "checkmark-done" };
      case "in_progress":
      case "ongoing":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA", icon: "car-sport" };
      case "submitted":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", icon: "send-outline" };
      case "rejected":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", icon: "close-circle" };
      case "request_changes":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", icon: "alert-circle-outline" };
      default:
        return { bg: "rgba(255, 255, 255, 0.08)", text: "#9CA3AF", icon: "help-circle" };
    }
  };

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
          <View className="flex-row items-center flex-1">
            <View style={styles.carIcon}>
              {item.thumbnailUrl ? (
                <LoadingImage 
                  uri={item.thumbnailUrl} 
                  style={styles.carThumbnail} 
                  resizeMode="cover" 
                />
              ) : (
                <Ionicons name="car-sport" size={24} color={COLORS.fourth} />
              )}
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-bold" style={styles.carModel}>
                {item.makerName} {item.modelName}
              </Text>
              <Text className="font-semibold mt-1" style={styles.carNumber}>
                {item.regNumber}
              </Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor.bg, alignSelf: 'flex-start' }]}
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

          {((item.assignmentStatus?.toUpperCase() === "IN_PROGRESS") || (item.assignmentStatus?.toUpperCase() === "ACCEPTED") || (item.assignmentStatus?.toUpperCase() === "REQUEST_CHANGES")) && (
            <>
              {(item.assignmentStatus?.toUpperCase() === "ACCEPTED" || item.assignmentStatus?.toUpperCase() === "IN_PROGRESS") && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handlePhoneCall(item)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="call" size={18} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.cardAcceptButton, submittingId === item.id && { opacity: 0.7 }]}
                onPress={() => handleStartInspection(item)}
                disabled={submittingId !== null}
              >
                {submittingId === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.cardAcceptButtonText}>
                    {item.assignmentStatus?.toUpperCase() === "REQUEST_CHANGES"
                      ? "Edit & Resubmit"
                      : item.assignmentStatus?.toUpperCase() === "IN_PROGRESS"
                        ? "Continue"
                        : "Start"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {(item.assignmentStatus === "COMPLETED" || item.assignmentStatus === "SUBMITTED") && (
            <TouchableOpacity
              style={[styles.cardAcceptButton, { backgroundColor: (!item.reportPdfUrl && item.assignmentStatus === "SUBMITTED") ? "#6B7280" : COLORS.fourth }]}
              onPress={() => {
                if (item.reportPdfUrl) {
                  Linking.openURL(item.reportPdfUrl).catch((err) => {
                    console.error("Failed to open report PDF:", err);
                    Alert.alert("Error", "Could not open the report link.");
                  });
                } else {
                  router.push(
                    `/inspection-report?id=${item.id}` +
                    `&vehicleCategory=${encodeURIComponent(item.vehicleType || "")}` +
                    `&vehicleSubtype=${encodeURIComponent(item.vehicleSubType || "")}` +
                    `&fuelType=${encodeURIComponent(item.fuelType || "")}` +
                    `&makerName=${encodeURIComponent(item.makerName || "")}` +
                    `&modelName=${encodeURIComponent(item.modelName || "")}` +
                    `&regNumber=${encodeURIComponent(item.regNumber || "")}`
                  );
                }
              }}
              disabled={!item.reportPdfUrl && item.assignmentStatus === "SUBMITTED"}
            >
              <Text style={styles.cardAcceptButtonText}>
                {(!item.reportPdfUrl && item.assignmentStatus === "SUBMITTED") ? "Report Processing..." : "View Report"}
              </Text>
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

        {/* Request Changes Remarks */}
        {activeTab === "request_changes" && item.assignmentStatus === "REQUEST_CHANGES" && (
          <View
            className="mt-3 flex-row items-start"
            style={styles.remarksBox}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
            <Text className="ml-2 flex-1" style={styles.remarksText}>
              <Text style={{ fontWeight: "bold" }}>Remarks: </Text>
              {item.remark || "No remarks provided"}
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
              onPress={() => setActiveTab("request_changes")}
              style={[styles.tab, activeTab === "request_changes" && styles.activeTab]}
            >
              <Text
                className="font-semibold"
                style={[
                  styles.tabText,
                  activeTab === "request_changes" && styles.activeTabText,
                ]}
              >
                Request Change
              </Text>
              {requestChangesCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === "request_changes" && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === "request_changes" && styles.activeBadgeText,
                    ]}
                  >
                    {requestChangesCount}
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
      acceptedCount,
      ongoingCount,
      submittedCount,
      completedCount,
      rejectedCount,
      requestChangesCount,
      scrollMetrics,
    ],
  );

  return (
    <ThemeBackground style={styles.container}>
      {headerComponent}
      <FlatList
        data={inspections}
        renderItem={renderInspection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator color={COLORS.fourth} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.fourth]}
            tintColor={COLORS.fourth}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.listLoaderContainer}>
              <ActivityIndicator size="large" color={COLORS.fourth} />
              <Text className="mt-4" style={styles.loadingText}>
                Loading inspections...
              </Text>
            </View>
          ) : (
            <View
              className="items-center justify-center"
              style={styles.emptyContainer}
            >
              <Ionicons name="car-outline" size={64} color={COLORS.third} />
              <Text className="mt-4 font-semibold" style={styles.emptyTitle}>
                No {activeTab} inspections
              </Text>
              <Text className="mt-2 text-center" style={styles.emptyText}>
                There are no {activeTab} car inspections at the moment
              </Text>
            </View>
          )
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

      {/* Video Call Verification Modal */}
      <Modal visible={videoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: "center", paddingVertical: 30 }]}>
            <View style={styles.videoIconRing}>
              <Ionicons name="videocam" size={40} color={COLORS.fourth} />
            </View>
            <Text style={styles.modalTitle}>Video Call Status</Text>
            <Text style={styles.modalSubtitle}>Is the video call with the vehicle owner complete?</Text>

            <View style={{ width: "100%", marginTop: 24, gap: 12 }}>
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={async () => {
                  setVideoModalVisible(false);
                  if (activeItemForVideo) {
                    try {
                      await AsyncStorage.setItem(`inspection_${activeItemForVideo.id}_video_completed`, "true");
                    } catch (storageErr) {
                      console.error("Error saving video complete state:", storageErr);
                    }
                    navigateToInspectionForm(activeItemForVideo);
                  }
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.modalDoneButtonText}>Yes, Video Call Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalRetryButton}
                onPress={() => {
                  if (activeItemForVideo) {
                    openWhatsApp(activeItemForVideo.whatsappNumber || activeItemForVideo.ownerPhone || activeItemForVideo.phone);
                  }
                }}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
                <Text style={styles.modalRetryButtonText}>Re-open WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setVideoModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pre-Video Call Verification Modal */}
      <Modal visible={preVideoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: "center", paddingVertical: 30 }]}>
            <View style={styles.videoIconRing}>
              <Ionicons name="videocam-outline" size={40} color={COLORS.fourth} />
            </View>
            <Text style={styles.modalTitle}>Start Video Call</Text>
            <Text style={styles.modalSubtitle}>Please start and complete the video call with the vehicle owner before proceeding with the inspection.</Text>

            <View style={{ width: "100%", marginTop: 24, gap: 12 }}>
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => {
                  setPreVideoModalVisible(false);
                  if (activeItemForVideo) {
                    openWhatsApp(activeItemForVideo.whatsappNumber || activeItemForVideo.ownerPhone || activeItemForVideo.phone);
                  }
                  setVideoModalVisible(true);
                }}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.modalDoneButtonText}>Continue to Video Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setPreVideoModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
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
  videoIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.third,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  modalDoneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22, 163, 74, 0.12)",
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  modalRetryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.success,
  },
  modalCancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gray600,
  },

  // Card Actions
  cardActions: { flexDirection: "row", marginTop: 12, gap: 10 },
  cardRejectButton: { flex: 1, height: 36, backgroundColor: "rgba(255, 255, 255, 0.06)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardRejectButtonText: { color: COLORS.gray900, fontSize: 13, fontWeight: "600" },
  cardAcceptButton: { flex: 1, height: 36, backgroundColor: COLORS.fourth, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardAcceptButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  callButton: { width: 36, height: 36, backgroundColor: "#16A34A", borderRadius: 8, justifyContent: "center", alignItems: "center" },

  container: {
    flex: 1,
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
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.third,
    marginTop: 2,
  },
  tabsWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  tabsScrollView: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    ...Platform.select({
      ios: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  tabsScrollContainer: {
    paddingVertical: 4,
  },
  scrollIndicatorContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  scrollIndicatorTrack: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  scrollIndicatorThumb: {
    height: 3,
    width: 120,
    backgroundColor: COLORS.fourth,
    borderRadius: 2,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginRight: 8,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  activeTab: {
    backgroundColor: COLORS.fourth,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.third,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  activeBadgeText: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
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
  carIcon: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  carThumbnail: { width: "100%", height: "100%", borderRadius: 22 },
  carModel: {
    fontSize: 17,
    color: COLORS.secondary,
  },
  carNumber: {
    fontSize: 14,
    color: COLORS.fourth,
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
    color: COLORS.third,
  },
  cardDetail: {
    fontSize: 13,
    color: COLORS.third,
  },
  rejectionBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  rejectionText: {
    fontSize: 12,
    color: "#EF4444",
  },
  remarksBox: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  remarksText: {
    fontSize: 12,
    color: "#F59E0B",
  },
  listLoaderContainer: {
    paddingVertical: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.third,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.secondary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.third,
  },
});
