import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { inspectionAPI } from "../../services/api/inspectionAPI";

export default function HomeTab() {
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await inspectionAPI.getAll();
      setInspections(data);
    } catch (error) {
      console.error("Error loading inspections:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInspections();
    setRefreshing(false);
  };

  // Calculate stats
  const pendingCount = inspections.filter((i) => i.status === "pending").length;
  const ongoingCount = 2; // Mock data - in real app, track ongoing inspections
  const completedCount = inspections.filter(
    (i) => i.status === "completed",
  ).length;
  const totalRevenue = "₹45,000"; // Mock data - calculate from completed inspections

  // Get recent 3 pending inspections
  const recentInspections = inspections
    .filter((i) => i.status === "pending")
    .slice(0, 3);

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

  const renderInspectionCard = (item) => {
    const typeColor = getInspectionTypeColor(item.inspectionType);

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
            <Text style={styles.cardTitle}>{item.carModel}</Text>
            <Text style={styles.cardNumber}>{item.carNumber}</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={12} color="#92400E" />
            <Text style={styles.pendingText}>Pending</Text>
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
            {item.inspectionType}
          </Text>
        </View>

        {/* Details */}
        <View className="flex-row items-center mt-2">
          <Ionicons name="person-outline" size={14} color="#9CA3AF" />
          <Text style={styles.cardDetail}>{item.ownerName}</Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={14} color="#9CA3AF" />
          <Text style={styles.cardDetail} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.cardDetail}>{item.date}</Text>
          <Ionicons
            name="time-outline"
            size={14}
            color="#9CA3AF"
            style={{ marginLeft: 12 }}
          />
          <Text style={styles.cardDetail}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1" style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E56A0"]}
            tintColor="#1E56A0"
          />
        }
      >
        {/* Stylish Greeting */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingCard}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <View style={styles.brandContainer}>
              <Text style={styles.brandTextPrimary}>Reecomm</Text>
              <Text style={styles.brandTextSecondary}>Inspections</Text>
            </View>
            <View style={styles.decorativeLine} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Pending */}
          <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          {/* On Going */}
          <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="car-sport-outline" size={28} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{ongoingCount}</Text>
            <Text style={styles.statLabel}>On Going</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {/* Completed */}
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
            </View>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          {/* Total Revenue */}
          <View style={[styles.statCard, { backgroundColor: "#E0E7FF" }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="wallet-outline" size={28} color="#4F46E5" />
            </View>
            <Text style={styles.statNumber}>{totalRevenue}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  greetingCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#1E56A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  brandContainer: {
    flexDirection: "column",
  },
  brandTextPrimary: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E56A0",
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  brandTextSecondary: {
    fontSize: 36,
    fontWeight: "800",
    color: "#3B82F6",
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: "#F59E0B",
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
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
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
    color: "#111827",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E56A0",
  },
  recentInspections: {
    paddingHorizontal: 16,
  },
  inspectionCard: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E56A0",
    marginTop: 2,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
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
    color: "#6B7280",
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
    color: "#9CA3AF",
    marginTop: 12,
  },
});
