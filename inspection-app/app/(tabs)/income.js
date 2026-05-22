import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { inspectionAPI } from "../../services/api/inspectionAPI";
import { COLORS } from "../../constants";
import ThemeBackground from "../../components/ThemeBackground";

export default function IncomeTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [incomeData, setIncomeData] = useState([]);
  const [kpis, setKpis] = useState({
    totalIncome: 0,
    pendingPaymentCount: 0,
  });

  useEffect(() => {
    loadIncomeData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return dateStr;
    }
  };

  const loadIncomeData = async () => {
    try {
      const [responseData, kpiData] = await Promise.allSettled([
        inspectionAPI.getIncomeHistory(),
        inspectionAPI.getIncomeKpis(),
      ]);

      if (responseData.status === "fulfilled") {
        const list = Array.isArray(responseData.value)
          ? responseData.value
          : (responseData.value?.data || []);

        const mapped = list.map((i) => {
          const carModel = [i.makerName, i.modelName, i.variantName].filter(Boolean).join(" ") || "Vehicle";
          const carNumber = i.regNumber || "—";
          const status = i.paidByAdmin ? "received" : "pending";
          const amount = Number(i.paidAmountByAdmin) || 2000;
          const rawType = i.requesterType || i.inspectionType || "Inspection";
          const inspectionType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase().replace(/_/g, " ");

          return {
            id: i.id,
            carModel,
            carNumber,
            inspectionDate: formatDate(i.acceptedAt || i.scheduledAt),
            amount,
            status,
            inspectionType,
            paymentDate: i.paidByAdminDate ? formatDate(i.paidByAdminDate) : undefined,
            expectedDate: i.scheduledAt ? formatDate(i.scheduledAt) : undefined,
          };
        });
        setIncomeData(mapped);
      }

      if (kpiData.status === "fulfilled" && kpiData.value) {
        const data = kpiData.value;
        setKpis({
          totalIncome: Number(data.totalIncome) || 0,
          pendingPaymentCount: Number(data.pendingPaymentCount) || 0,
        });
      }
    } catch (error) {
      console.error("Error loading income:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncomeData();
    setRefreshing(false);
  };

  // Totals are fetched directly from the KPIs API

  const getInspectionTypeColor = (type) => {
    const t = (type || "").toUpperCase();
    if (t.includes("CONSULT")) {
      return { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA" };
    } else if (t.includes("SELLER")) {
      return { bg: "rgba(244, 63, 94, 0.15)", text: "#FB7185" };
    } else if (t.includes("BUYER")) {
      return { bg: "rgba(99, 102, 241, 0.15)", text: "#818CF8" };
    } else if (t.includes("VIDEO")) {
      return { bg: "rgba(16, 185, 129, 0.15)", text: "#34D399" };
    } else {
      return { bg: "rgba(156, 163, 175, 0.15)", text: "#9CA3AF" };
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
              { 
                backgroundColor: isPending ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                borderWidth: 1,
                borderColor: isPending ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.25)"
              },
            ]}
          >
            <Text
              style={[
                styles.amountText,
                { color: isPending ? "#F59E0B" : "#10B981" },
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
          <Ionicons name="calendar-outline" size={14} color={COLORS.third} />
          <Text style={styles.cardDetail}>
            Inspection: {item.inspectionDate}
          </Text>
        </View>

        {isPending ? (
          <View className="flex-row items-center mt-2">
            <Ionicons name="time-outline" size={14} color="#FBBF24" />
            <Text style={[styles.cardDetail, { color: "#FBBF24" }]}>
              Expected: {item.expectedDate}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center mt-2">
            <Ionicons name="checkmark-circle" size={14} color="#34D399" />
            <Text style={[styles.cardDetail, { color: "#34D399" }]}>
              Received: {item.paymentDate}
            </Text>
          </View>
        )}

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPending ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
              borderColor: isPending ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.25)",
            },
          ]}
        >
          <Ionicons
            name={isPending ? "hourglass-outline" : "checkmark-done"}
            size={12}
            color={isPending ? "#F59E0B" : "#10B981"}
          />
          <Text
            style={[
              styles.statusText,
              { color: isPending ? "#F59E0B" : "#10B981" },
            ]}
          >
            {isPending ? "Pending" : "Received"}
          </Text>
        </View>
      </View>
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Pending Payments */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <View style={[styles.statIconContainer, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Ionicons name="hourglass-outline" size={22} color="#F59E0B" />
              </View>
              <View style={[styles.statBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Text style={[styles.statBadgeText, { color: "#F59E0B" }]}>Pending</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>Pending Payments</Text>
            <Text style={styles.statNumber}>
              {kpis.pendingPaymentCount}
            </Text>
          </View>

          {/* Received Income */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <View style={[styles.statIconContainer, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <Ionicons name="wallet-outline" size={22} color="#10B981" />
              </View>
              <View style={[styles.statBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <Text style={[styles.statBadgeText, { color: "#10B981" }]}>Received</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>Received Income</Text>
            <Text style={styles.statNumber}>
              ₹{kpis.totalIncome.toLocaleString()}
            </Text>
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
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
    alignItems: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
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
    fontSize: 22,
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
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.third,
  },
  incomeList: {
    paddingHorizontal: 16,
  },
  incomeCard: {
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
    color: COLORS.third,
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
