import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { apiService } from "../../services/api/api";

export default function TabLayout() {
  const [userName, setUserName] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Try cached data first for immediate display
      const cached = await apiService.getUserData();
      if (cached) {
        setUserName(cached.firstname && cached.lastname ? `${cached.firstname} ${cached.lastname}` : cached.username || "");
        if (cached.firstname && cached.lastname) {
          setInitials(`${cached.firstname.charAt(0)}${cached.lastname.charAt(0)}`.toUpperCase());
        }
      }
      
      // 2. Refresh from API to get latest name
      try {
        const fresh = await apiService.get("/api/v1/website/vehicle/inspector/profile");
        if (fresh?.data) {
          const profile = fresh.data;
          setUserName(`${profile.firstname} ${profile.lastname}`);
          setInitials(`${profile.firstname.charAt(0)}${profile.lastname.charAt(0)}`.toUpperCase());
          await apiService.setUserData(profile);
        }
      } catch (error) {
        console.log("Error refreshing profile in layout:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E56A0",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: true,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 10,
          paddingTop: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 20,
          position: "absolute",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <View style={styles.profileImage}>
                {initials ? (
                  <Text style={styles.initialsText}>{initials}</Text>
                ) : (
                  <Ionicons name="person" size={28} color="#1E56A0" />
                )}
              </View>
              <View style={styles.headerTextContainer}>
              <Text style={styles.headerGreeting}>Hi, {userName || "Inspector"}</Text>
                <Text style={styles.headerSubtitle}>How is your day?</Text>
              </View>
            </View>
          ),
          headerLeft: () => null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: "Home",
          headerRight: () => (
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color="#1E56A0" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="inspections"
        options={{
          title: "Inspections",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "clipboard" : "clipboard-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: "Inspections",
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: "Income",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: "Income",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -10,
    
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  initialsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E56A0",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
});
