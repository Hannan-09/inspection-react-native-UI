import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

export default function IncomeTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [incomeData, setIncomeData] = useState([]);

  useEffect(() => {
    loadIncomeData();
  }, []);

  const loadIncomeData = () => {
    // Mock income data - in real app, fetch from API
    const mockData = [
      {
        id: "1",
        carModel: "Toyota Camry 2022",
        carNumber: "MH-12-AB-1234",
        inspectionDate: "2026-05-09",
        amount: 2500,
        status: "received",
        inspectionType: "Consultant",
        paymentDate: "2026-05-10",
      },
      {
        id: "2",
        carModel: "Honda City 2021",
        carNumber: "DL-8C-XY-5678",
        inspectionDate: "2026-05-08",
        amount: 2000,
        status: "received",
        inspectionType: "Seller",
        paymentDate: "2026-05-09",
      },
      {
        id: "3",
        carModel: "Maruti Swift 2020",
        carNumber: "KA-01-MN-9012",
        inspectionDate: "2026-05-11",
        amount: 1800,
        status: "pending",
        inspectionType: "Buyer",
        expectedDate: "2026-05-15",
      },
      {
        id: "4",
        carModel: "Tata Nexon EV 2022",
        carNumber: "MH-02-CD-7890",
        inspectionDate: "2026-05-06",
        amount: 3000,
        status: "received",
        inspectionType: "Seller",
        paymentDate: "2026-05-07",
      },
      {
        id: "5",
        carModel: "Hyundai Creta 2023",
        carNumber: "GJ-05-PQ-3456",
        inspectionDate: "2026-05-10",
        amount: 2200,
        status: "pending",
        inspectionType: "Consultant",
        expectedDate: "2026-05-14",
      },
      {
        id: "6",
        carModel: "BMW 3 Series 2022",
        carNumber: "MH-01-XY-4567",
        inspectionDate: "2026-05-05",
        amount: 5000,
        status: "received",
        inspectionType: "Buyer",
        paymentDate: "2026-05-06",
      },
    ];
    setIncomeData(mockData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncomeData();
    setRefreshing(false);
  };

  // Calculate totals
  const pendingIncome = incomeData
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + item.amount, 0);

  const receivedIncome = incomeData
    .filter((item) => item.status === "received")
    .reduce((sum, item) => sum + item.amount, 0);

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

  const renderIncomeCard = (item) => {
    const typeColor = getInspectionTypeColor(item.inspectionType);
    const isPending = item.status === "pending";

    return (
      <View key={item.id} style={styles.incomeCard}>
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text style={styles.cardCarModel}>{item.carModel}</Text>
            <Text style={styles.cardCarNumber}>{item.carNumber}</Text>
          </View>
          <View
            style={[
              styles.amountBadge,
              { backgroundColor: isPending ? "#FEF3C7" : "#DCFCE7" },
            ]}
          >
            <Text
              style={[
                styles.amountText,
                { color: isPending ? "#92400E" : "#166534" },
              ]}
            >
              ₹{item.amount.toLocaleString()}
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
            {item.inspectionType}
          </Text>
        </View>

        {/* Details */}
        <View className="flex-row items-center mt-3">
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.cardDetail}>
            Inspection: {item.inspectionDate}
          </Text>
        </View>

        {isPending ? (
          <View className="flex-row items-center mt-2">
            <Ionicons name="time-outline" size={14} color="#F59E0B" />
            <Text style={[styles.cardDetail, { color: "#F59E0B" }]}>
              Expected: {item.expectedDate}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center mt-2">
            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
            <Text style={[styles.cardDetail, { color: "#16A34A" }]}>
              Received: {item.paymentDate}
            </Text>
          </View>
        )}

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPending ? "#FEF3C7" : "#DCFCE7",
              borderColor: isPending ? "#F59E0B" : "#16A34A",
            },
          ]}
        >
          <Ionicons
            name={isPending ? "hourglass-outline" : "checkmark-done"}
            size={12}
            color={isPending ? "#92400E" : "#166534"}
          />
          <Text
            style={[
              styles.statusText,
              { color: isPending ? "#92400E" : "#166534" },
            ]}
          >
            {isPending ? "Pending" : "Received"}
          </Text>
        </View>
      </View>
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Pending Income */}
          <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="hourglass-outline" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>
              ₹{pendingIncome.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Pending Income</Text>
          </View>

          {/* Received Income */}
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="wallet" size={28} color="#16A34A" />
            </View>
            <Text style={styles.statNumber}>
              ₹{receivedIncome.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Received Income</Text>
          </View>
        </View>

        {/* Income History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Income History</Text>
          <Text style={styles.sectionCount}>
            {incomeData.length} Inspections
          </Text>
        </View>

        {/* Income Cards */}
        <View style={styles.incomeList}>
          {incomeData.length > 0 ? (
            incomeData.map((item) => renderIncomeCard(item))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No income history yet</Text>
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  totalIncomeCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: "#1E56A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E56A0",
  },
  totalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  incomeList: {
    paddingHorizontal: 16,
  },
  incomeCard: {
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
  cardCarModel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  cardCarNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E56A0",
    marginTop: 2,
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
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
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 16,
  },
});
