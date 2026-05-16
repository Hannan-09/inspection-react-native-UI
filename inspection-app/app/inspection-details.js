import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Linking, Platform, Modal, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { inspectionAPI } from "../services/api/inspectionAPI";

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
        <View style={[style, { justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6" }]}>
          <ActivityIndicator size="small" color="#1E56A0" />
        </View>
      )}
    </View>
  );
};

export default function InspectionDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedImageCategory, setSelectedImageCategory] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [params.id]);

  const getStatusInfo = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "ASSIGNED":
        return { bg: "#FEF3C7", text: "#92400E" };
      case "IN_PROGRESS":
      case "ONGOING":
      case "ACCEPTED":
        return { bg: "#DBEAFE", text: "#1E40AF" };
      case "COMPLETED":
        return { bg: "#DCFCE7", text: "#166534" };
      case "REJECTED":
        return { bg: "#FEE2E2", text: "#991B1B" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const loadDetails = async () => {
    if (!params.id) return;
    try {
      setLoading(true);
      const response = await inspectionAPI.getAssignedInspectionById(params.id);
      setDetails(response);
      
      // Initialize image category
      if (response.vehicleImages && response.vehicleImages.length > 0) {
        setSelectedImageCategory(response.vehicleImages[0].imageKey);
      } else {
        setSelectedImageCategory("");
      }
    } catch (error) {
      console.error("Error loading inspection details:", error);
      Alert.alert("Error", "Failed to load inspection details.");
    } finally {
      setLoading(false);
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

  const openMaps = () => {
    const address = encodeURIComponent(`${details.address}, ${details.cityName}, ${details.stateName}`);
    const url = Platform.OS === "ios"
      ? `maps://app?daddr=${address}`
      : `geo:0,0?q=${address}`;
    Linking.openURL(url);
  };

  const makeCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Required", "Please enter a reason for rejection.");
      return;
    }
    setSubmitting(true);
    try {
      await inspectionAPI.reject(details.id, rejectReason.trim());
      setRejectModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Rejected",
        text2: "Inspection has been rejected.",
        position: "top",
        visibilityTime: 1500,
      });
      setTimeout(() => router.back(), 1200);
    } catch (error) {
      Alert.alert("Error", "Failed to reject inspection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMainAction = async () => {
    if (details.assignmentStatus === "ASSIGNED") {
      try {
        setSubmitting(true);
        await inspectionAPI.acceptAssignment(details.id);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Inspection accepted successfully!",
          position: "top",
          visibilityTime: 2000,
        });
        setDetails(prev => ({ ...prev, assignmentStatus: "IN_PROGRESS" }));
        loadDetails(); // Reload to update status to IN_PROGRESS from backend
      } catch (error) {
        Alert.alert("Error", "Failed to accept inspection. Please try again.");
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        setSubmitting(true);
        // Only call the START api if the status is ACCEPTED
        if (details.assignmentStatus?.toUpperCase() === "ACCEPTED") {
          await inspectionAPI.startInspection(details.id);
        }
        
        // Navigate to the start inspection screen
        router.push(
          `/start-inspection?id=${details.id}` +
          `&vehicleCategory=${encodeURIComponent(details.vehicleType || "")}` +
          `&vehicleSubtype=${encodeURIComponent(details.vehicleSubType || "")}` +
          `&fuelType=${encodeURIComponent(details.fuelType || "")}` +
          `&makerName=${encodeURIComponent(details.makerName || "")}` +
          `&modelName=${encodeURIComponent(details.modelName || "")}` +
          `&regNumber=${encodeURIComponent(details.regNumber || "")}`
        );
      } catch (error) {
        console.error("Error starting inspection:", error);
        Alert.alert("Error", "Failed to start inspection. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const statusInfo = getStatusInfo(details?.assignmentStatus);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color="#1E56A0" />
        <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>Loading details...</Text>
      </View>
    );
  }

  if (!details) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Inspection details not found</Text>
    </View>
  );

  // Group images by category
  const imagesByCategory = {};
  (details.vehicleImages || []).forEach(img => {
    if (!imagesByCategory[img.imageKey]) imagesByCategory[img.imageKey] = [];
    imagesByCategory[img.imageKey].push(img.imageUrl);
  });

  const categories = Object.keys(imagesByCategory).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    icon: key === "thumbnail" ? "image-outline" : "car-outline"
  }));

  return (
    <View className="flex-1" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vehicle Info Card */}
        <View style={styles.card}>
          <View className="flex-row items-center mb-3">
            <View style={styles.carIcon}>
              {details.thumbnailUrl ? (
                <LoadingImage 
                  uri={details.thumbnailUrl} 
                  style={styles.carThumbnail} 
                  resizeMode="cover" 
                />
              ) : (
                <Ionicons name="car-sport" size={28} color="#1E56A0" />
              )}
            </View>
            <View className="flex-1 ml-3">
              <Text style={styles.carModel}>{details.makerName} {details.modelName}</Text>
              <Text style={styles.carNumber}>{details.regNumber}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {details.assignmentStatus?.replace(/_/g, " ")}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.specsGrid}>
            {[
              { icon: "calendar-outline", label: "Year", val: details.yearOfMfg },
              { icon: "color-palette-outline", label: "Color", val: details.colour },
              { icon: "speedometer-outline", label: "KM Driven", val: `${details.kmDriven} km` },
              { icon: "water-outline", label: "Fuel", val: details.fuelType },
              { icon: "person-outline", label: "Owner", val: `${details.ownership} Owner` },
              { icon: "settings-outline", label: "Transmission", val: details.transmissionType },
            ].map((s) => (
              <View key={s.label} style={styles.specItem}>
                <Ionicons name={s.icon} size={16} color="#6B7280" />
                <View className="ml-2">
                  <Text style={styles.specLabel}>{s.label}</Text>
                  <Text style={styles.specValue}>{s.val || "—"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Owner Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text style={styles.ownerName}>{details.ownerFirstname} {details.ownerLastname}</Text>
              <Text style={styles.ownerRole}>{details.ownerUserRole?.replace(/_/g, " ")}</Text>
            </View>
            <TouchableOpacity style={styles.actionIcon} onPress={() => makeCall(details.whatsappNumber)}>
              <Ionicons name="call" size={20} color="#1E56A0" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={2}>{details.address}, {details.cityName}</Text>
          </View>
        </View>

        {/* Requester Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Requester Information</Text>
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text style={styles.ownerName}>{details.requestedUserFirstname} {details.requestedUserLastname}</Text>
              <Text style={styles.ownerRole}>{details.requesterType?.replace(/_/g, " ")}</Text>
            </View>
          </View>
        </View>

        {/* Inspection Details */}
        <View style={styles.card}>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Inspection Schedule</Text>
            <TouchableOpacity style={styles.actionIcon} onPress={openMaps}>
              <Ionicons name="navigate" size={20} color="#1E56A0" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>Scheduled: {formatDate(details.scheduledAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>Time: {formatTime(details.scheduledAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>Type: {details.inspectionType?.replace(/_/g, " ")}</Text>
          </View>
          {details.remarks && (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Instructions:</Text>
              <Text style={styles.noteText}>{details.remarks}</Text>
            </View>
          )}
        </View>

        {/* Images */}
        {categories.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vehicle Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageTabs}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setSelectedImageCategory(cat.key)}
                  style={[styles.imageTab, selectedImageCategory === cat.key && styles.imageTabActive]}
                >
                  <Text style={[styles.imageTabText, selectedImageCategory === cat.key && styles.imageTabTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.imageGallery}>
              {imagesByCategory[selectedImageCategory]?.map((img, idx) => (
                <LoadingImage key={idx} uri={img} style={styles.vehicleImage} resizeMode="cover" />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomButtons}>
        {((details.assignmentStatus?.toUpperCase() === "ASSIGNED") || 
          (details.assignmentStatus?.toUpperCase() === "IN_PROGRESS") ||
          (details.assignmentStatus?.toUpperCase() === "ACCEPTED") ||
          (details.assignmentStatus?.toUpperCase() === "ONGOING")) && (
          <>
            <TouchableOpacity 
              style={styles.rejectButton} 
              onPress={() => setRejectModalVisible(true)}
              disabled={submitting}
            >
              <Ionicons name="close-circle" size={22} color="#fff" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={handleMainAction}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={details.assignmentStatus?.toUpperCase() === 'ASSIGNED' ? "checkmark-circle" : "play-circle"} 
                    size={22} 
                    color="#fff" 
                  />
                  <Text style={styles.acceptButtonText}>
                    {details.assignmentStatus?.toUpperCase() === 'ASSIGNED' ? "Accept" : 
                     details.assignmentStatus?.toUpperCase() === 'IN_PROGRESS' ? "Continue to Inspection" : "Start Inspection"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {(details.assignmentStatus?.toUpperCase() === "COMPLETED" || details.assignmentStatus?.toUpperCase() === "SUBMITTED") && (
          <TouchableOpacity 
            style={[styles.acceptButton, { marginLeft: 0, backgroundColor: "#1E56A0" }]} 
            onPress={() => router.push(
              `/inspection-report?id=${details.id}` +
              `&vehicleCategory=${encodeURIComponent(details.vehicleType || "")}` +
              `&vehicleSubtype=${encodeURIComponent(details.vehicleSubType || "")}` +
              `&fuelType=${encodeURIComponent(details.fuelType || "")}` +
              `&makerName=${encodeURIComponent(details.makerName || "")}` +
              `&modelName=${encodeURIComponent(details.modelName || "")}` +
              `&regNumber=${encodeURIComponent(details.regNumber || "")}`
            )}
          >
            <Ionicons name="document-text" size={22} color="#fff" />
            <Text style={styles.acceptButtonText}>View Inspection Report</Text>
          </TouchableOpacity>
        )}

        {details.assignmentStatus === "REJECTED" && (
          <TouchableOpacity 
            style={[styles.rejectButton, { marginRight: 0, backgroundColor: "#F3F4F6" }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="close-circle" size={22} color="#DC2626" />
            <Text style={[styles.rejectButtonText, { color: "#DC2626" }]}>Assignment Rejected</Text>
          </TouchableOpacity>
        )}
      </View>

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
              <TouchableOpacity style={styles.modalConfirm} onPress={handleReject} disabled={submitting}>
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
  container: { backgroundColor: "#F9FAFB" },
  card: { backgroundColor: "#fff", margin: 16, marginBottom: 0, padding: 16, borderRadius: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  carIcon: { width: 50, height: 50, backgroundColor: "#EBF2FA", borderRadius: 25, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  carThumbnail: { width: "100%", height: "100%", borderRadius: 25 },
  carModel: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  carNumber: { fontSize: 14, color: "#6B7280", marginTop: 2, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  specsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  specItem: { width: "48%", flexDirection: "row", alignItems: "center", marginBottom: 12 },
  specLabel: { fontSize: 12, color: "#9CA3AF" },
  specValue: { fontSize: 14, fontWeight: "600", color: "#374151" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1E56A0", marginBottom: 12 },
  ownerName: { fontSize: 15, fontWeight: "bold", color: "#374151" },
  ownerRole: { fontSize: 13, color: "#6B7280" },
  actionIcon: { width: 40, height: 40, backgroundColor: "#F3F4F6", borderRadius: 20, justifyContent: "center", alignItems: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { fontSize: 14, color: "#4B5563", marginLeft: 8 },
  locationLink: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  locationLinkText: { fontSize: 14, color: "#1E56A0", marginLeft: 8, fontWeight: "600" },
  noteBox: { backgroundColor: "#FFFBEB", padding: 12, borderRadius: 8, marginTop: 12, borderLeftWidth: 4, borderLeftColor: "#F59E0B" },
  noteTitle: { fontSize: 14, fontWeight: "bold", color: "#92400E", marginBottom: 2 },
  noteText: { fontSize: 13, color: "#B45309" },
  imageTabs: { marginBottom: 12 },
  imageTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#F3F4F6" },
  imageTabActive: { backgroundColor: "#1E56A0" },
  imageTabText: { fontSize: 13, color: "#6B7280" },
  imageTabTextActive: { color: "#fff", fontWeight: "bold" },
  imageGallery: { width: "100%", height: 200 },
  vehicleImage: { width: "100%", height: "100%", borderRadius: 8 },
  bottomButtons: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  rejectButton: { flex: 1, flexDirection: "row", height: 50, backgroundColor: "#DC2626", borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 8 },
  rejectButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  acceptButton: { flex: 1, flexDirection: "row", height: 50, backgroundColor: "#16A34A", borderRadius: 12, justifyContent: "center", alignItems: "center", marginLeft: 8 },
  acceptButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, fontSize: 15, height: 100, textAlignVertical: "top" },
  modalCancel: { flex: 1, height: 48, justifyContent: "center", alignItems: "center" },
  modalCancelText: { fontSize: 16, fontWeight: "bold", color: "#6B7280" },
  modalConfirm: { flex: 2, height: 48, backgroundColor: "#DC2626", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  modalConfirmText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});
