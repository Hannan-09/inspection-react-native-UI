import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { apiService } from "../../services/api/api";
import { COLORS } from "../../constants";

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
        tabBarActiveTintColor: COLORS.fourth,
        tabBarInactiveTintColor: COLORS.third,
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.08)",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          height: 80,
          paddingBottom: 10,
          paddingTop: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
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
                  <Ionicons name="person" size={28} color={COLORS.fourth} />
                )}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerGreeting}>Reecomm</Text>
                <Text style={styles.headerSubtitle}>Inspections</Text>
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
              <Ionicons name="notifications" size={24} color={COLORS.fourth} />
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
    backgroundColor: COLORS.gray300,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    justifyContent: "center",
    rowGap: 0,
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  initialsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.fourth,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.fourth,
    fontWeight: "600",
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
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
