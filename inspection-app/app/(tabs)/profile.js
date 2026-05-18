import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { authAPI } from "../../services/api/authAPI";
import { apiService } from "../../services/api/api";
import { API_CONFIG } from "../../config/api.config";

export default function ProfileTab() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Try cached data first (instant), then refresh from API
      const cached = await apiService.getUserData();
      if (cached) setUserData(cached);
      // Attempt live refresh in background
      const fresh = await authAPI.getCurrentUser();
      if (fresh) setUserData(fresh);
    } catch {
      // Cached data shown if API fails — already set above
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await authAPI.logout();
          } finally {
            setLoggingOut(false);
            router.replace("/login");
          }
        },
      },
    ]);
  };

  // Helper to calculate experience from createdAt
  const getExperienceDuration = (createdAtStr) => {
    if (!createdAtStr) return "0 months";
    const created = new Date(createdAtStr);
    const now = new Date();
    
    let years = now.getFullYear() - created.getFullYear();
    let months = now.getMonth() - created.getMonth();
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    const yearText = years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : "";
    const monthText = months > 0 ? `${months} ${months === 1 ? "month" : "months"}` : "";
    
    if (yearText && monthText) {
      return `${yearText} ${monthText}`;
    } else if (yearText) {
      return yearText;
    } else if (monthText) {
      return monthText;
    }
    return "0.0";
  };

  // Fallback display data
  const display = {
    name: userData?.firstname && userData?.lastname ? `${userData.firstname} ${userData.lastname}` : userData?.username || "Inspector",
    role: userData?.inspectorType?.replace(/_/g, " ") || "Car Inspector",
    email: userData?.email || "—",
    phone: userData?.contactNumber || "—",
    experience: getExperienceDuration(userData?.createdAt),
    inspectionsCompleted: userData?.totalInspectionsCompleted !== undefined && userData?.totalInspectionsCompleted !== null ? userData.totalInspectionsCompleted : "0",
    rating: userData?.averageRating !== undefined && userData?.averageRating !== null ? userData.averageRating : "0",
    address: userData?.address ? `${userData.address}, ${userData.city?.name || ""}, ${userData.state?.name || ""}, ${userData.country?.name || ""}` : "—",
    aadhar: userData?.aadharCardNumber || "—",
    dl: userData?.drivingLicenseNumber || "—",
    upiId: userData?.upiId || "—",
    initials: userData?.firstname && userData?.lastname ? `${userData.firstname.charAt(0)}${userData.lastname.charAt(0)}`.toUpperCase() : "",
    aadharFront: userData?.aadharCardFrontUrl,
    aadharBack: userData?.aadharCardBackUrl,
    dlFront: userData?.drivingLicenseFrontUrl,
    dlBack: userData?.drivingLicenseBackUrl,
  };

  // Document Viewer State
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null); // { title: string, front: string, back: string }
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleOpenDoc = (type) => {
    let doc = null;
    if (type === "aadhar") {
      doc = { title: "Aadhar Card", front: display.aadharFront, back: display.aadharBack };
    } else if (type === "dl") {
      doc = { title: "Driving License", front: display.dlFront, back: display.dlBack };
    }

    if (doc?.front || doc?.back) {
      setSelectedDoc(doc);
      setIsFlipped(false);
      flipAnimation.setValue(0);
      setDocModalVisible(true);
    } else {
      Alert.alert("Not Found", "Document images are not available.");
    }
  };

  const toggleFlip = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Edit Profile State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectorType, setSelectorType] = useState(null); // 'state' | 'city' | null
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contactNumber: "",
    age: "",
    upiId: "",
    address: "",
    stateId: "",
    cityId: "",
  });

  const openEditModal = async () => {
    if (!userData) return;
    
    setFormData({
      firstname: userData.firstname || "",
      lastname: userData.lastname || "",
      email: userData.email || "",
      contactNumber: userData.contactNumber || "",
      age: userData.age?.toString() || "",
      upiId: userData.upiId || "",
      address: userData.address || "",
      stateId: userData.state?.id?.toString() || "",
      cityId: userData.city?.id?.toString() || "",
    });

    setEditModalVisible(true);
    
    // Load states
    try {
      const stateList = await authAPI.getStates();
      setStates(stateList);
      
      // If user already has a state, load cities
      if (userData.state?.id) {
        const cityList = await authAPI.getCities(userData.state.id);
        setCities(cityList);
      }
    } catch (error) {
      console.log("Error loading address data:", error);
    }
  };

  const handleStateChange = async (stateId) => {
    setFormData(prev => ({ ...prev, stateId, cityId: "" }));
    setCities([]);
    try {
      const cityList = await authAPI.getCities(stateId);
      setCities(cityList);
    } catch (error) {
      console.log("Error loading cities:", error);
    }
  };

  const handleUpdateProfile = async () => {
    // Basic validation
    if (!formData.firstname || !formData.lastname || !formData.email) {
      Toast.show({
        type: "error",
        text1: "Required Fields",
        text2: "Please fill in firstname, lastname and email.",
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await authAPI.updateProfile({
        ...formData,
        age: parseInt(formData.age) || 0,
        stateId: formData.stateId,
        cityId: formData.cityId,
      });

      if (response.status === "OK") {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile updated successfully",
        });
        setEditModalVisible(false);
        loadUser(); // Refresh data
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message || "Something went wrong",
      });
    } finally {
      setUpdating(false);
    }
  };

  const menuItems = [
    {
      id: 1,
      icon: "person-outline",
      label: "Edit Profile",
      color: "#1E56A0",
      onPress: openEditModal,
    },
    {
      id: 2,
      icon: "document-text-outline",
      label: "My Reports",
      color: "#1E56A0",
      onPress: () => console.log("My Reports"),
    },
    {
      id: 3,
      icon: "wallet-outline",
      label: "Payment History",
      color: "#1E56A0",
      onPress: () => console.log("Payment History"),
    },
    {
      id: 4,
      icon: "settings-outline",
      label: "Settings",
      color: "#1E56A0",
      onPress: () => console.log("Settings"),
    },
    {
      id: 5,
      icon: "help-circle-outline",
      label: "Help & Support",
      color: "#1E56A0",
      onPress: () => console.log("Help & Support"),
    },
    {
      id: 6,
      icon: "information-circle-outline",
      label: "About",
      color: "#1E56A0",
      onPress: () => console.log("About"),
    },
  ];

  if (!userData && !loggingOut) {
    // Show skeleton / loading state
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color="#1E56A0" />
        <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerBlueSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                {display.initials ? (
                  <Text style={styles.initialsText}>{display.initials}</Text>
                ) : (
                  <Ionicons name="person" size={48} color="#fff" />
                )}
              </View>
            </View>

            <Text style={styles.userName}>{display.name}</Text>
            <Text style={styles.userRole}>{display.role}</Text>
          </View>

          {/* Stats Row - White Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconBox}>
                  <Ionicons name="clipboard" size={24} color="#1E56A0" />
                </View>
                <Text style={styles.statNumber}>
                  {display.inspectionsCompleted}
                </Text>
                <Text style={styles.statLabel}>Inspections</Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[styles.statIconBox, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>{display.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[styles.statIconBox, { backgroundColor: "#DCFCE7" }]}
                >
                  <Ionicons name="time" size={24} color="#16A34A" />
                </View>
                <Text style={styles.statNumber}>{display.experience}</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail-outline" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{display.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call-outline" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{display.phone}</Text>
            </View>
          </View>
        </View>

        {/* Personal & Document Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal & Documents</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location-outline" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{display.address}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.infoRow} 
            activeOpacity={0.7}
            onPress={() => handleOpenDoc("aadhar")}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="card-outline" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.infoLabel}>Aadhar Number</Text>
              <Text style={styles.infoValue}>{display.aadhar}</Text>
            </View>
            <Ionicons name="eye-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.infoRow} 
            activeOpacity={0.7}
            onPress={() => handleOpenDoc("dl")}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="id-card-outline" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.infoLabel}>Driving License</Text>
              <Text style={styles.infoValue}>{display.dl}</Text>
            </View>
            <Ionicons name="eye-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="wallet-outline" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.infoLabel}>UPI ID</Text>
              <Text style={styles.infoValue}>{display.upiId}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.sectionCard}>
          {menuItems.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && { opacity: 0.7 }]}
          activeOpacity={0.8}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#DC2626" size="small" />
          ) : (
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          )}
          <Text style={styles.logoutText}>{loggingOut ? "Logging out..." : "Logout"}</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Document Viewer Modal */}
      <Modal
        visible={docModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDocModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDoc?.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setDocModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Card Content with Flip Animation */}
            <View style={styles.cardWrapper}>
              <Animated.View style={[styles.flipCard, frontAnimatedStyle, { opacity: isFlipped ? 0 : 1 }]}>
                <Image 
                  source={{ uri: selectedDoc?.front }} 
                  style={styles.docImage}
                  resizeMode="contain"
                />
                <View style={styles.cardLabel}>
                  <Text style={styles.cardLabelText}>FRONT SIDE</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.flipCard, styles.flipCardBack, backAnimatedStyle, { opacity: isFlipped ? 1 : 0 }]}>
                <Image 
                  source={{ uri: selectedDoc?.back }} 
                  style={styles.docImage}
                  resizeMode="contain"
                />
                <View style={styles.cardLabel}>
                  <Text style={styles.cardLabelText}>BACK SIDE</Text>
                </View>
              </Animated.View>
            </View>

            {/* Flip Button */}
            <TouchableOpacity 
              style={styles.flipButton}
              activeOpacity={0.8}
              onPress={toggleFlip}
            >
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.flipButtonText}>
                {isFlipped ? "Show Front Side" : "Show Back Side"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Selector Modal (State/City) */}
      <Modal
        visible={!!selectorType}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectorType(null)}
      >
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorContent}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>Select {selectorType === "state" ? "State" : "City"}</Text>
              <TouchableOpacity onPress={() => setSelectorType(null)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectorType === "state" ? states : cities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectorItem}
                  onPress={() => {
                    if (selectorType === "state") {
                      handleStateChange(item.id.toString());
                    } else {
                      setFormData(prev => ({ ...prev, cityId: item.id.toString() }));
                    }
                    setSelectorType(null);
                  }}
                >
                  <Text style={[
                    styles.selectorItemText,
                    (selectorType === "state" ? formData.stateId === item.id.toString() : formData.cityId === item.id.toString()) && styles.selectorItemActive
                  ]}>
                    {item.name}
                  </Text>
                  {(selectorType === "state" ? formData.stateId === item.id.toString() : formData.cityId === item.id.toString()) && (
                    <Ionicons name="checkmark-circle" size={20} color="#1E56A0" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.editOverlay}>
            <View style={styles.editContent}>
              {/* Header */}
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Form Fields */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstname}
                    onChangeText={(val) => setFormData(prev => ({ ...prev, firstname: val }))}
                    placeholder="Enter first name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastname}
                    onChangeText={(val) => setFormData(prev => ({ ...prev, lastname: val }))}
                    placeholder="Enter last name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(val) => setFormData(prev => ({ ...prev, email: val }))}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contact Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.contactNumber}
                    onChangeText={(val) => setFormData(prev => ({ ...prev, contactNumber: val }))}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.age}
                    onChangeText={(val) => setFormData(prev => ({ ...prev, age: val }))}
                    placeholder="Enter age"
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>UPI ID</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.upiId}
                    onChangeText={(val) => setFormData(prev => ({ ...prev, upiId: val }))}
                    placeholder="Enter UPI ID"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Full Address</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
                    value={formData.address}
                    onChangeText={(val) => setFormData(prev => ({ ...prev, address: val }))}
                    placeholder="Enter address"
                    multiline={true}
                  />
                </View>

                {/* Dropdowns */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>State</Text>
                  <TouchableOpacity 
                    style={styles.pickerTrigger}
                    onPress={() => setSelectorType("state")}
                  >
                    <Text style={[styles.pickerValue, !formData.stateId && { color: "#9CA3AF" }]}>
                      {states.find(s => s.id.toString() === formData.stateId)?.name || "Select State"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>City</Text>
                  <TouchableOpacity 
                    style={styles.pickerTrigger}
                    onPress={() => formData.stateId ? setSelectorType("city") : Alert.alert("Select State", "Please select a state first")}
                  >
                    <Text style={[styles.pickerValue, !formData.cityId && { color: "#9CA3AF" }]}>
                      {cities.find(c => c.id.toString() === formData.cityId)?.name || "Select City"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.saveButton, updating && { opacity: 0.7 }]}
                  onPress={handleUpdateProfile}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Update Profile</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
  },
  headerCard: {
    backgroundColor: "#fff",
    padding: 10,
    overflow: "hidden",
  },
  headerBlueSection: {
    backgroundColor: "#1E56A0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  statsSection: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  initialsText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  statIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#1E56A0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#1E56A0",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 0,
    backgroundColor: "#FEE2E2",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DC2626",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  cardWrapper: {
    width: "100%",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  flipCard: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    backfaceVisibility: "hidden",
    position: "absolute",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  flipCardBack: {
    backgroundColor: "#F3F4F6",
  },
  docImage: {
    width: "100%",
    height: "100%",
  },
  cardLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(30, 86, 160, 0.85)",
    paddingVertical: 6,
    alignItems: "center",
  },
  cardLabelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  flipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E56A0",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 30,
    width: "100%",
    shadowColor: "#1E56A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  flipButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Edit Profile Styles
  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  editContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "90%",
    padding: 24,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  editTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerTrigger: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerValue: {
    fontSize: 15,
    color: "#111827",
  },
  saveButton: {
    backgroundColor: "#1E56A0",
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#1E56A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Selector Styles
  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  selectorContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "60%",
    padding: 24,
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  selectorItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectorItemText: {
    fontSize: 16,
    color: "#374151",
  },
  selectorItemActive: {
    color: "#1E56A0",
    fontWeight: "bold",
  },
});
