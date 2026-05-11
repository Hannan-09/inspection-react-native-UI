import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
} from "react-native";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { inspectionAPI } from "../../services/api/inspectionAPI";

export default function InspectionsTab() {
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Animated values for scroll indicator
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [scrollMetrics, setScrollMetrics] = useState({
    contentWidth: 0,
    layoutWidth: 0,
  });

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await inspectionAPI.getAll();
      setInspections(data);
    } catch (error) {
      console.error("Error loading inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInspections();
    setRefreshing(false);
  };

  // Filter inspections based on active tab
  const filteredInspections = inspections.filter((item) => {
    if (activeTab === "pending") return item.status === "pending";
    if (activeTab === "ongoing") return item.status === "ongoing";
    if (activeTab === "completed") return item.status === "completed";
    if (activeTab === "rejected") return item.status === "rejected";
    return true;
  });

  // Get counts for each status
  const pendingCount = inspections.filter((i) => i.status === "pending").length;
  const ongoingCount = inspections.filter((i) => i.status === "ongoing").length;
  const completedCount = inspections.filter(
    (i) => i.status === "completed",
  ).length;
  const rejectedCount = inspections.filter(
    (i) => i.status === "rejected",
  ).length;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return { bg: "#DCFCE7", text: "#166534", icon: "checkmark-circle" };
      case "pending":
        return { bg: "#FEF3C7", text: "#92400E", icon: "time-outline" };
      case "ongoing":
        return { bg: "#DBEAFE", text: "#1E40AF", icon: "car-sport" };
      case "rejected":
        return { bg: "#FEE2E2", text: "#991B1B", icon: "close-circle" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280", icon: "help-circle" };
    }
  };

  const getInspectionTypeColor = (type) => {
    switch (type) {
      case "Consultant":
        return { bg: "#DBEAFE", text: "#1E40AF" };
      case "Seller":
        return { bg: "#FCE7F3", text: "#9F1239" };
      case "Buyer":
        return { bg: "#E0E7FF", text: "#3730A3" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const renderInspection = ({ item }) => {
    const statusColor = getStatusColor(item.status);
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
              {item.carModel}
            </Text>
            <Text className="font-semibold mt-1" style={styles.carNumber}>
              {item.carNumber}
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
              {item.status}
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
            {item.inspectionType}
          </Text>
        </View>

        {/* Owner Info */}
        <View className="flex-row items-center mt-3">
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text className="ml-2" style={styles.infoText}>
            {item.ownerName}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center mt-2">
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text className="ml-2 flex-1" style={styles.infoText}>
            {item.location}
          </Text>
        </View>

        {/* Date & Time */}
        <View className="flex-row items-center mt-2">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text className="ml-2" style={styles.infoText}>
            {item.date}
          </Text>
          <Ionicons
            name="time-outline"
            size={16}
            color="#6B7280"
            className="ml-4"
            style={{ marginLeft: 16 }}
          />
          <Text className="ml-2" style={styles.infoText}>
            {item.time}
          </Text>
        </View>

        {/* Rejection Reason (if rejected) */}
        {item.status === "rejected" && item.rejectionReason && (
          <View
            className="mt-3 flex-row items-start"
            style={styles.rejectionBox}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text className="ml-2 flex-1" style={styles.rejectionText}>
              {item.rejectionReason}
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
                Ongoing
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
        data={filteredInspections}
        renderItem={renderInspection}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E56A0"]}
            tintColor="#1E56A0"
          />
        }
        ListEmptyComponent={
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
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    paddingBottom: 20,
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
