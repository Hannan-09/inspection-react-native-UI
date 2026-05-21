import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { inspectionAPI } from "../../services/api/inspectionAPI";
import { COLORS } from "../../constants";

export default function IncomeTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [incomeData, setIncomeData] = useState([]);

  useEffect(() => {
    loadIncomeData();
  }, []);

  const loadIncomeData = async () => {
    try {
      const all = await inspectionAPI.getAll();
      // Derive income records from completed/rejected inspections
      const mapped = all
        .filter((i) => i.status === "completed" || i.status === "ongoing")
        .map((i) => ({
          id: i.id,
          carModel: i.carModel,
          carNumber: i.carNumber,
          inspectionDate: i.date,
          amount: i.amount || 2000, // use amount from API or default
          status: i.status === "completed" ? "received" : "pending",
          inspectionType: i.inspectionType,
          paymentDate: i.status === "completed" ? i.completedDate || i.date : undefined,
          expectedDate: i.status === "ongoing" ? i.date : undefined,
        }));
      setIncomeData(mapped);
    } catch (error) {
      console.error("Error loading income:", error);
    }
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
          <Ionicons name="calendar-outline" size={14} color={COLORS.gray400} />
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
            colors={[COLORS.fourth]}
            tintColor={COLORS.fourth}
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
              <Ionicons name="wallet-outline" size={64} color={COLORS.third} />
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
    backgroundColor: COLORS.gray50,
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
    color: COLORS.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: "600",
    textAlign: "center",
  },
  totalIncomeCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: COLORS.fourth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: "600",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.fourth,
  },
  totalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
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
    color: COLORS.secondary,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray600,
  },
  incomeList: {
    paddingHorizontal: 16,
  },
  incomeCard: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.secondary,
  },
  cardCarNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.fourth,
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
    color: COLORS.gray600,
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
    color: COLORS.third,
    marginTop: 16,
  },
});
