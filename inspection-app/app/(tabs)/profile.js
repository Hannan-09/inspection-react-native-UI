import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileTab() {
  // Mock user data - in real app, get from auth/API
  const userData = {
    name: "Hannan",
    role: "Car Inspector",
    email: "hannan@reecomm.com",
    phone: "+91 98765 43210",
    experience: "5 Years",
    inspectionsCompleted: 247,
    rating: 4.8,
  };

  const menuItems = [
    {
      id: 1,
      icon: "person-outline",
      label: "Edit Profile",
      color: "#1E56A0",
      onPress: () => console.log("Edit Profile"),
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

  return (
    <View className="flex-1" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerBlueSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
              <TouchableOpacity style={styles.editIconButton}>
                <Ionicons name="camera" size={18} color="#1E56A0" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userRole}>{userData.role}</Text>
          </View>

          {/* Stats Row - White Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconBox}>
                  <Ionicons name="clipboard" size={24} color="#1E56A0" />
                </View>
                <Text style={styles.statNumber}>
                  {userData.inspectionsCompleted}
                </Text>
                <Text style={styles.statLabel}>Inspections</Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[styles.statIconBox, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>{userData.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[styles.statIconBox, { backgroundColor: "#DCFCE7" }]}
                >
                  <Ionicons name="time" size={24} color="#16A34A" />
                </View>
                <Text style={styles.statNumber}>{userData.experience}</Text>
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
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call-outline" size={20} color="#1E56A0" />
            </View>
            <View className="flex-1">
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userData.phone}</Text>
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
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => console.log("Logout")}
        >
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

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
  editIconButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#1E56A0",
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
});
