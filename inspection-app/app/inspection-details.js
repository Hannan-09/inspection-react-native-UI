import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Linking, Platform, Modal, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { inspectionAPI } from "../services/api/inspectionAPI";
import { populateInspectionStorage } from "../utils/reportMapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants";

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
          <ActivityIndicator size="small" color={COLORS.fourth} />
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
  const [videoModalVisible, setVideoModalVisible] = useState(false);

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
      case "REQUEST_CHANGES":
        return { bg: "#FFEDD5", text: "#C2410C" };
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

  const navigateToInspectionForm = () => {
    router.push(
      `/start-inspection?id=${details.id}` +
      `&vehicleCategory=${encodeURIComponent(details.vehicleType || "")}` +
      `&vehicleSubtype=${encodeURIComponent(details.vehicleSubType || "")}` +
      `&fuelType=${encodeURIComponent(details.fuelType || "")}` +
      `&makerName=${encodeURIComponent(details.makerName || "")}` +
      `&modelName=${encodeURIComponent(details.modelName || "")}` +
      `&regNumber=${encodeURIComponent(details.regNumber || "")}`
    );
  };

  const handleMainAction = async () => {
    const isRequestChanges = details.assignmentStatus?.toUpperCase() === "REQUEST_CHANGES";

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
        const t = (details.vehicleType || "").toUpperCase();
        const cat = (t.includes("TWO") || t === "2W" || t.includes("2")) ? "2W" : "4W";

        // Only call the START api if the status is ACCEPTED
        if (details.assignmentStatus?.toUpperCase() === "ACCEPTED") {
          if (cat === "2W") {
            await inspectionAPI.startInspection2W(details.id);
          } else {
            await inspectionAPI.startInspection(details.id);
          }
        }

        // Pre-populate AsyncStorage if editing an inspection under REQUEST_CHANGES
        if (isRequestChanges) {
          try {
            await populateInspectionStorage(inspectionAPI, details.id, cat, details.fuelType);
          } catch (populateErr) {
            console.error("AsyncStorage populate error:", populateErr);
            Alert.alert("Error", "Failed to load prefilled inspection report details. Starting with a blank form.");
          }
        }
        
        const isVideoCall = details.inspectionType?.toUpperCase().includes("VIDEO");

        if (isVideoCall) {
          const completedVal = await AsyncStorage.getItem(`inspection_${details.id}_video_completed`);
          if (completedVal === "true") {
            navigateToInspectionForm();
          } else {
            openWhatsApp(details.whatsappNumber || details.ownerPhone || details.phone);
            setVideoModalVisible(true);
          }
        } else {
          navigateToInspectionForm();
        }
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.gray100 }}>
        <ActivityIndicator size="large" color={COLORS.fourth} />
        <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 14 }}>Loading details...</Text>
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
          <View className="flex-row items-center">
            <View style={styles.carIcon}>
              {details.thumbnailUrl ? (
                <LoadingImage 
                  uri={details.thumbnailUrl} 
                  style={styles.carThumbnail} 
                  resizeMode="cover" 
                />
              ) : (
                <Ionicons name="car-sport" size={28} color={COLORS.fourth} />
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
        </View>

        {/* Vehicle Specifications Card */}
        <View style={styles.newCard}>
          <Text style={styles.newCardTitle}>Vehicle Specifications</Text>
          <View style={styles.specTable}>
            {[
              { label: "Make & Model", val: `${details.makerName || ""} ${details.modelName || ""} ${details.variantName || ""}`.trim() || "—" },
              { label: "Transmission", val: details.transmissionType || "—" },
              { label: "Fuel Type", val: `${details.fuelType || "—"}${details.isCngFitted ? " + CNG (" + (details.cngType || "") + ")" : ""}` },
              { label: "Year of Mfg", val: details.yearOfMfg || "—" },
              { label: "KM Driven", val: details.kmDriven ? `${details.kmDriven.toLocaleString("en-IN")} km` : "—" },
              { label: "Color", val: details.colour || "—" },
              { label: "Seating", val: details.seatingCapacity ? `${details.seatingCapacity} Seater` : "5 Seater" },
              { label: "Ownership", val: details.ownership === 1 ? "First Owner" : details.ownership === 2 ? "Second Owner" : details.ownership === 3 ? "Third Owner" : details.ownership ? `${details.ownership} Owner` : "—" },
              { label: "Spare Key", val: details.spareKey ? "Yes" : "No" },
              { label: "Spare Wheel", val: details.spareWheel ? "Yes" : "No" },
              { label: "Has Challan", val: details.hasChallan ? "Yes" : "No", isStatus: details.hasChallan, isRed: details.hasChallan },
              { label: "Insurance", val: details.insurance ? "Active" : "Inactive", isStatus: true, isRed: !details.insurance },
              { label: "PUC", val: details.puc ? "Active" : "Inactive", isStatus: true, isRed: !details.puc },
              { label: "RC Status", val: details.rcFrontUrl ? "Active" : "Inactive", isStatus: true, isRed: !details.rcFrontUrl },
            ].map((item, idx) => (
              <View key={item.label} style={[styles.specRow, idx === 13 && { borderBottomWidth: 0 }]}>
                <Text style={styles.specRowLabel}>{item.label}</Text>
                <Text style={[
                  styles.specRowValue, 
                  item.isStatus && { color: item.isRed ? "#DC2626" : "#16A34A", fontWeight: "bold" }
                ]}>
                  {item.val}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Seller Details */}
        <View style={styles.newCard}>
          <View className="flex-row justify-between items-center mb-2">
            <Text style={styles.newCardTitle}>Seller Details</Text>
            <View style={styles.sellerTag}>
              <Text style={styles.sellerTagText}>Seller</Text>
            </View>
          </View>

          <View style={styles.sellerInfoRow}>
            <Ionicons name="person" size={18} color={COLORS.fourth} style={styles.sellerIcon} />
            <Text style={styles.sellerNameText}>
              {details.ownerFirstname} {details.ownerLastname}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.sellerInfoRow} 
            activeOpacity={0.7} 
            onPress={() => makeCall(details.whatsappNumber)}
          >
            <Ionicons name="call" size={18} color={COLORS.success} style={styles.sellerIcon} />
            <Text style={styles.sellerPhoneText}>
              {details.whatsappNumber || "—"}
            </Text>
          </TouchableOpacity>

          <View style={styles.sellerInfoRow}>
            <Ionicons name="mail" size={18} color="#6B7280" style={styles.sellerIcon} />
            <Text style={styles.sellerEmailText}>
              {details.ownerEmail || `${details.ownerFirstname?.toLowerCase()}.${details.ownerLastname?.toLowerCase()}@email.com`}
            </Text>
          </View>
        </View>

        {/* Requester Details */}
        {details.requestedUserFirstname ? (
          <View style={styles.newCard}>
            <View className="flex-row justify-between items-center mb-2">
              <Text style={styles.newCardTitle}>Requester Details</Text>
              <View style={styles.requesterTag}>
                <Text style={styles.requesterTagText}>
                  {details.requesterType?.replace(/_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "Buyer"}
                </Text>
              </View>
            </View>

            <View style={styles.sellerInfoRow}>
              <Ionicons name="person" size={18} color={COLORS.fourth} style={styles.sellerIcon} />
              <Text style={styles.sellerNameText}>
                {details.requestedUserFirstname} {details.requestedUserLastname}
              </Text>
            </View>

            <View style={styles.sellerInfoRow}>
              <Ionicons name="briefcase" size={18} color="#6B7280" style={styles.sellerIcon} />
              <Text style={styles.sellerEmailText}>
                {details.requestedUserRole?.replace(/_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "Consultation"}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Inspection Schedule */}
        <View style={styles.newCard}>
          <Text style={styles.newCardTitle}>Inspection Schedule</Text>

          {/* Date Row */}
          <View style={styles.scheduleItem}>
            <View style={styles.scheduleIconBox}>
              <Ionicons name="calendar-sharp" size={20} color={COLORS.fourth} />
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Date</Text>
              <Text style={styles.scheduleValue}>{formatDate(details.scheduledAt)}</Text>
            </View>
          </View>

          {/* Time Row */}
          <View style={styles.scheduleItem}>
            <View style={styles.scheduleIconBox}>
              <Ionicons name="time" size={20} color={COLORS.fourth} />
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Time</Text>
              <Text style={styles.scheduleValue}>{formatTime(details.scheduledAt)}</Text>
            </View>
          </View>

          {/* Type Row */}
          <View style={styles.scheduleItem}>
            <View style={styles.scheduleIconBox}>
              <Ionicons name="document-text" size={20} color={COLORS.fourth} />
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Type</Text>
              <Text style={styles.scheduleValue}>
                {details.inspectionType?.replace(/_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "Consultant"}
              </Text>
            </View>
          </View>
        </View>

        {/* Inspection Location */}
        <View style={styles.newCard}>
          <View className="flex-row justify-between items-center mb-4">
            <Text style={styles.newCardTitle}>Inspection Location</Text>
            <TouchableOpacity style={styles.directionButton} activeOpacity={0.8} onPress={openMaps}>
              <Ionicons name="navigate-sharp" size={16} color="#fff" />
              <Text style={styles.directionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Address Box */}
          <View style={styles.addressBox}>
            <Ionicons name="location" size={22} color={COLORS.danger} style={styles.addressIcon} />
            <Text style={styles.addressBoxText}>
              {details.address ? `${details.address}, ${details.cityName || ""}, ${details.stateName || ""} - ${details.pincode || ""}` : "—"}
            </Text>
          </View>

          {/* Instructions Alert Box */}
          {(details.remark || details.remarks) ? (
            <View style={styles.instructionBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.fourth} style={styles.instructionIcon} />
              <Text style={styles.instructionBoxText}>{details.remark || details.remarks}</Text>
            </View>
          ) : null}
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
              <Ionicons name="close-circle" size={22} color={COLORS.primary} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={handleMainAction}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons 
                    name={details.assignmentStatus?.toUpperCase() === 'ASSIGNED' ? "checkmark-circle" : "play-circle"} 
                    size={22} 
                    color={COLORS.primary} 
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
            style={[styles.acceptButton, { marginLeft: 0, backgroundColor: COLORS.fourth }]} 
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
            <Ionicons name="document-text" size={22} color={COLORS.primary} />
            <Text style={styles.acceptButtonText}>View Inspection Report</Text>
          </TouchableOpacity>
        )}

        {details.assignmentStatus?.toUpperCase() === "REQUEST_CHANGES" && (
          <TouchableOpacity 
            style={[styles.acceptButton, { marginLeft: 0, backgroundColor: "#D97706" }]} 
            onPress={handleMainAction}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="create-outline" size={22} color={COLORS.primary} />
                <Text style={styles.acceptButtonText}>Edit & Resubmit</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {details.assignmentStatus === "REJECTED" && (
          <TouchableOpacity 
            style={[styles.rejectButton, { marginRight: 0, backgroundColor: COLORS.gray100 }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="close-circle" size={22} color={COLORS.danger} />
            <Text style={[styles.rejectButtonText, { color: COLORS.danger }]}>Assignment Rejected</Text>
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
                {submitting ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.modalConfirmText}>Confirm Reject</Text>}
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
                  try {
                    await AsyncStorage.setItem(`inspection_${details.id}_video_completed`, "true");
                  } catch (storageErr) {
                    console.error("Error saving video complete state:", storageErr);
                  }
                  navigateToInspectionForm();
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.modalDoneButtonText}>Yes, Video Call Complete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalRetryButton} 
                onPress={() => openWhatsApp(details.whatsappNumber)}
              >
                <Ionicons name="logo-whatsapp" size={20} color={COLORS.success} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.gray100 },
  card: { backgroundColor: COLORS.primary, margin: 16, marginBottom: 0, padding: 16, borderRadius: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  carIcon: { width: 50, height: 50, backgroundColor: COLORS.gray100, borderRadius: 25, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  carThumbnail: { width: "100%", height: "100%", borderRadius: 25 },
  carModel: { fontSize: 18, fontWeight: "bold", color: COLORS.secondary },
  carNumber: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  divider: { height: 1, backgroundColor: COLORS.gray100, marginVertical: 12 },
  specsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  specItem: { width: "48%", flexDirection: "row", alignItems: "center", marginBottom: 12 },
  specLabel: { fontSize: 12, color: COLORS.third },
  specValue: { fontSize: 14, fontWeight: "600", color: COLORS.secondary },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.fourth, marginBottom: 12 },
  ownerName: { fontSize: 15, fontWeight: "bold", color: COLORS.secondary },
  ownerRole: { fontSize: 13, color: COLORS.textSecondary },
  actionIcon: { width: 40, height: 40, backgroundColor: COLORS.gray100, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 8 },
  locationLink: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  locationLinkText: { fontSize: 14, color: COLORS.fourth, marginLeft: 8, fontWeight: "600" },
  noteBox: { backgroundColor: "#FFFBEB", padding: 12, borderRadius: 8, marginTop: 12, borderLeftWidth: 4, borderLeftColor: "#F59E0B" },
  noteTitle: { fontSize: 14, fontWeight: "bold", color: "#92400E", marginBottom: 2 },
  noteText: { fontSize: 13, color: "#B45309" },
  imageTabs: { marginBottom: 12 },
  imageTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: COLORS.gray100 },
  imageTabActive: { backgroundColor: COLORS.fourth },
  imageTabText: { fontSize: 13, color: COLORS.textSecondary },
  imageTabTextActive: { color: COLORS.primary, fontWeight: "bold" },
  imageGallery: { width: "100%", height: 200 },
  vehicleImage: { width: "100%", height: "100%", borderRadius: 8 },
  bottomButtons: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", padding: 16, backgroundColor: COLORS.primary, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  rejectButton: { flex: 1, flexDirection: "row", height: 50, backgroundColor: COLORS.danger, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 8 },
  rejectButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  acceptButton: { flex: 1, flexDirection: "row", height: 50, backgroundColor: COLORS.success, borderRadius: 12, justifyContent: "center", alignItems: "center", marginLeft: 8 },
  acceptButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.secondary, marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: "600", color: COLORS.secondary, marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 12, padding: 12, fontSize: 15, height: 100, textAlignVertical: "top" },
  modalCancel: { flex: 1, height: 48, justifyContent: "center", alignItems: "center" },
  modalCancelText: { fontSize: 16, fontWeight: "bold", color: COLORS.textSecondary },
  modalConfirm: { flex: 2, height: 48, backgroundColor: COLORS.danger, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  modalConfirmText: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  
  // Premium Card Redesign Styles
  newCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  newCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  sellerTag: {
    backgroundColor: "#DEF7EC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  sellerTagText: {
    color: "#03543F",
    fontSize: 12,
    fontWeight: "bold",
  },
  sellerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  sellerIcon: {
    width: 24,
    textAlign: "center",
  },
  sellerNameText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 10,
    fontWeight: "500",
  },
  sellerPhoneText: {
    fontSize: 15,
    color: COLORS.success,
    marginLeft: 10,
    fontWeight: "600",
  },
  sellerEmailText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  scheduleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleInfo: {
    marginLeft: 14,
  },
  scheduleLabel: {
    fontSize: 12,
    color: COLORS.third,
    marginBottom: 2,
    fontWeight: "500",
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  directionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.fourth,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    shadowColor: COLORS.fourth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  directionButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
  },
  addressBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    borderRadius: 8,
    padding: 14,
    marginTop: 6,
    alignItems: "flex-start",
  },
  addressIcon: {
    marginTop: 1,
  },
  addressBoxText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  instructionBox: {
    flexDirection: "row",
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 14,
    marginTop: 14,
    alignItems: "center",
  },
  instructionIcon: {},
  instructionBoxText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.fourth,
    marginLeft: 8,
    lineHeight: 18,
    fontWeight: "600",
  },
  specTable: {
    marginTop: 10,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  specRowLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  specRowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary,
    textAlign: "right",
  },
  requesterTag: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  requesterTagText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "bold",
  },
  videoIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.primary,
  },
  modalRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
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
    color: COLORS.textSecondary,
  },
});



