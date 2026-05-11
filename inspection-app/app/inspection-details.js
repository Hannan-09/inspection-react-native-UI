import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function InspectionDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedImageCategory, setSelectedImageCategory] = useState("front");

  // Mock detailed data (in real app, fetch based on params.id)
  const inspectionDetails = {
    id: params.id || "1",
    status: "pending",

    // Vehicle Details
    vehicle: {
      model: "Toyota Camry 2022",
      registrationNumber: "MH-12-AB-1234",
      make: "Toyota",
      variant: "Camry Hybrid",
      year: 2022,
      color: "Pearl White",
      fuelType: "Hybrid",
      transmission: "Automatic",
      kmDriven: "15,000 km",
      engineCapacity: "2487 cc",
      seatingCapacity: "5 Seater",
      ownership: "First Owner",
      insuranceValid: "Valid till Dec 2026",
      pucValid: "Valid till Aug 2026",
      rcStatus: "Active",
    },

    // Owner/Seller Details
    requesterType: "seller", // or "consultant"
    seller: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.kumar@email.com",
      address: "Plot No. 45, Andheri West, Mumbai, Maharashtra - 400058",
      coordinates: { lat: 19.1136, lng: 72.8697 },
    },

    // Consultant Details (if requesterType is consultant)
    consultant: {
      name: "AutoCheck Services",
      contactPerson: "Amit Sharma",
      phone: "+91 98888 12345",
      email: "amit@autocheck.com",
      address: "Shop 12, Link Road, Andheri West, Mumbai - 400053",
    },

    // Inspection Details
    inspection: {
      type: "Consultant",
      scheduledDate: "2026-05-09",
      scheduledTime: "10:00 AM",
      location: "Andheri West, Mumbai",
      fullAddress:
        "Plot No. 45, Near Metro Station, Andheri West, Mumbai, Maharashtra - 400058",
      specialInstructions:
        "Please bring OBD scanner. Owner will be available from 10 AM to 12 PM.",
    },

    // Vehicle Images
    images: {
      front: [
        "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Front+View+1",
        "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Front+View+2",
      ],
      back: [
        "https://via.placeholder.com/400x300/E24A4A/FFFFFF?text=Back+View+1",
        "https://via.placeholder.com/400x300/E24A4A/FFFFFF?text=Back+View+2",
      ],
      side: [
        "https://via.placeholder.com/400x300/4AE290/FFFFFF?text=Side+View+1",
        "https://via.placeholder.com/400x300/4AE290/FFFFFF?text=Side+View+2",
      ],
      interior: [
        "https://via.placeholder.com/400x300/E2A04A/FFFFFF?text=Interior+1",
        "https://via.placeholder.com/400x300/E2A04A/FFFFFF?text=Interior+2",
      ],
      speedometer: [
        "https://via.placeholder.com/400x300/A04AE2/FFFFFF?text=Speedometer",
      ],
      engine: [
        "https://via.placeholder.com/400x300/4AE2E2/FFFFFF?text=Engine+Bay",
      ],
    },
  };

  const openMaps = () => {
    const address = encodeURIComponent(
      inspectionDetails.inspection.fullAddress,
    );
    const url =
      Platform.OS === "ios"
        ? `maps://app?daddr=${address}`
        : `geo:0,0?q=${address}`;
    Linking.openURL(url);
  };

  const makeCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const imageCategories = [
    { key: "front", label: "Front", icon: "car-outline" },
    { key: "back", label: "Back", icon: "car-outline" },
    { key: "side", label: "Side", icon: "car-outline" },
    { key: "interior", label: "Interior", icon: "car-sport-outline" },
    { key: "speedometer", label: "Speedometer", icon: "speedometer-outline" },
    { key: "engine", label: "Engine", icon: "construct-outline" },
  ];

  return (
    <View className="flex-1" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vehicle Info Card */}
        <View style={styles.card}>
          <View className="flex-row items-center mb-3">
            <View style={styles.carIcon}>
              <Ionicons name="car-sport" size={28} color="#1E56A0" />
            </View>
            <View className="flex-1 ml-3">
              <Text style={styles.carModel}>
                {inspectionDetails.vehicle.model}
              </Text>
              <Text style={styles.carNumber}>
                {inspectionDetails.vehicle.registrationNumber}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Vehicle Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <Text style={styles.specLabel}>Year</Text>
              <Text style={styles.specValue}>
                {inspectionDetails.vehicle.year}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons
                name="color-palette-outline"
                size={18}
                color="#6B7280"
              />
              <Text style={styles.specLabel}>Color</Text>
              <Text style={styles.specValue}>
                {inspectionDetails.vehicle.color}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="speedometer-outline" size={18} color="#6B7280" />
              <Text style={styles.specLabel}>KM Driven</Text>
              <Text style={styles.specValue}>
                {inspectionDetails.vehicle.kmDriven}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={18} color="#6B7280" />
              <Text style={styles.specLabel}>Fuel</Text>
              <Text style={styles.specValue}>
                {inspectionDetails.vehicle.fuelType}
              </Text>
            </View>
          </View>
        </View>

        {/* Complete Vehicle Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Specifications</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Make & Model</Text>
            <Text style={styles.detailValue}>
              {inspectionDetails.vehicle.make}{" "}
              {inspectionDetails.vehicle.variant}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transmission</Text>
            <Text style={styles.detailValue}>
              {inspectionDetails.vehicle.transmission}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Engine Capacity</Text>
            <Text style={styles.detailValue}>
              {inspectionDetails.vehicle.engineCapacity}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Seating</Text>
            <Text style={styles.detailValue}>
              {inspectionDetails.vehicle.seatingCapacity}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ownership</Text>
            <Text style={styles.detailValue}>
              {inspectionDetails.vehicle.ownership}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Insurance</Text>
            <Text style={styles.detailValue}>
              {inspectionDetails.vehicle.insuranceValid}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PUC</Text>
            <Text style={styles.detailValue}>
              {inspectionDetails.vehicle.pucValid}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>RC Status</Text>
            <Text style={[styles.detailValue, { color: "#16A34A" }]}>
              {inspectionDetails.vehicle.rcStatus}
            </Text>
          </View>
        </View>

        {/* Seller/Consultant Details */}
        {inspectionDetails.requesterType === "seller" ? (
          <View style={styles.card}>
            <View className="flex-row items-center justify-between mb-3">
              <Text style={styles.sectionTitle}>Seller Details</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>Seller</Text>
              </View>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="person" size={20} color="#1E56A0" />
              <Text style={styles.contactText}>
                {inspectionDetails.seller.name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => makeCall(inspectionDetails.seller.phone)}
            >
              <Ionicons name="call" size={20} color="#16A34A" />
              <Text style={[styles.contactText, { color: "#16A34A" }]}>
                {inspectionDetails.seller.phone}
              </Text>
            </TouchableOpacity>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={20} color="#6B7280" />
              <Text style={styles.contactText}>
                {inspectionDetails.seller.email}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View className="flex-row items-center justify-between mb-3">
              <Text style={styles.sectionTitle}>Consultant Details</Text>
              <View style={[styles.typeBadge, { backgroundColor: "#E0E7FF" }]}>
                <Text style={[styles.typeBadgeText, { color: "#3730A3" }]}>
                  Consultant
                </Text>
              </View>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="business" size={20} color="#1E56A0" />
              <Text style={styles.contactText}>
                {inspectionDetails.consultant.name}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="person" size={20} color="#6B7280" />
              <Text style={styles.contactText}>
                {inspectionDetails.consultant.contactPerson}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => makeCall(inspectionDetails.consultant.phone)}
            >
              <Ionicons name="call" size={20} color="#16A34A" />
              <Text style={[styles.contactText, { color: "#16A34A" }]}>
                {inspectionDetails.consultant.phone}
              </Text>
            </TouchableOpacity>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={20} color="#6B7280" />
              <Text style={styles.contactText}>
                {inspectionDetails.consultant.email}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactRow}>
              <Ionicons name="location" size={20} color="#DC2626" />
              <Text style={[styles.contactText, { flex: 1 }]}>
                {inspectionDetails.consultant.address}
              </Text>
            </View>
          </View>
        )}

        {/* Inspection Schedule */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inspection Schedule</Text>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleIcon}>
              <Ionicons name="calendar" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.scheduleLabel}>Date</Text>
              <Text style={styles.scheduleValue}>
                {inspectionDetails.inspection.scheduledDate}
              </Text>
            </View>
          </View>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleIcon}>
              <Ionicons name="time" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.scheduleLabel}>Time</Text>
              <Text style={styles.scheduleValue}>
                {inspectionDetails.inspection.scheduledTime}
              </Text>
            </View>
          </View>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleIcon}>
              <Ionicons name="document-text" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.scheduleLabel}>Type</Text>
              <Text style={styles.scheduleValue}>
                {inspectionDetails.inspection.type}
              </Text>
            </View>
          </View>
        </View>

        {/* Inspection Location */}
        <View style={styles.card}>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={styles.sectionTitle}>Inspection Location</Text>
            <TouchableOpacity
              onPress={openMaps}
              style={styles.directionsButton}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.directionsText}>Directions</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Ionicons name="location" size={24} color="#DC2626" />
            <Text style={styles.addressText}>
              {inspectionDetails.inspection.fullAddress}
            </Text>
          </View>
          {inspectionDetails.inspection.specialInstructions && (
            <View style={styles.instructionsBox}>
              <Ionicons name="information-circle" size={18} color="#2563EB" />
              <Text style={styles.instructionsText}>
                {inspectionDetails.inspection.specialInstructions}
              </Text>
            </View>
          )}
        </View>

        {/* Vehicle Images */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Images</Text>

          {/* Image Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageTabs}
            contentContainerStyle={styles.imageTabsContent}
          >
            {imageCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => setSelectedImageCategory(category.key)}
                style={[
                  styles.imageTab,
                  selectedImageCategory === category.key &&
                    styles.imageTabActive,
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={18}
                  color={
                    selectedImageCategory === category.key ? "#fff" : "#6B7280"
                  }
                />
                <Text
                  style={[
                    styles.imageTabText,
                    selectedImageCategory === category.key &&
                      styles.imageTabTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Image Gallery */}
          <ScrollView
            horizontal={
              inspectionDetails.images[selectedImageCategory]?.length > 1
            }
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
            contentContainerStyle={
              inspectionDetails.images[selectedImageCategory]?.length === 1
                ? styles.imageGallerySingle
                : styles.imageGalleryContent
            }
          >
            {inspectionDetails.images[selectedImageCategory]?.map(
              (image, index) => (
                <View
                  key={index}
                  style={
                    inspectionDetails.images[selectedImageCategory]?.length ===
                    1
                      ? styles.imageContainerFull
                      : styles.imageContainer
                  }
                >
                  <Image
                    source={{ uri: image }}
                    style={
                      inspectionDetails.images[selectedImageCategory]
                        ?.length === 1
                        ? styles.vehicleImageFull
                        : styles.vehicleImage
                    }
                  />
                </View>
              ),
            )}
          </ScrollView>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.rejectButton}>
          <Ionicons name="close-circle" size={22} color="#fff" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() =>
            router.push(`/start-inspection?id=${inspectionDetails.id}`)
          }
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.approveButtonText}>Start Inspection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E56A0",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  carIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  carModel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  carNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E56A0",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  specItem: {
    width: "50%",
    alignItems: "center",
    marginBottom: 16,
  },
  specLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  typeBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginTop: 2,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E56A0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  directionsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
  },
  addressBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    lineHeight: 20,
  },
  instructionsBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    marginLeft: 8,
    lineHeight: 18,
  },
  imageTabs: {
    marginBottom: 16,
  },
  imageTabsContent: {
    paddingRight: 10,
  },
  imageTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  imageTabActive: {
    backgroundColor: "#1E56A0",
  },
  imageTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 6,
  },
  imageTabTextActive: {
    color: "#fff",
  },
  imageGallery: {
    marginHorizontal: -16,
  },
  imageGalleryContent: {
    paddingHorizontal: 10,
    paddingRight: 0,
  },
  imageGallerySingle: {
    paddingHorizontal: 10,
    width: "100%",
  },
  imageContainer: {
    marginRight: 12,
  },
  imageContainerFull: {
    width: "100%",
  },
  vehicleImage: {
    width: 280,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  vehicleImageFull: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  bottomButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
});
