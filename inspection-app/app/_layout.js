import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import "../global.css";
import { COLORS } from "../constants";
import { useEffect } from "react";
// import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } else {
          // await messaging().requestPermission();
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    requestNotificationPermission();

    /*
    // Listen for foreground notifications
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Toast.show({
        type: 'info',
        text1: remoteMessage.notification?.title || 'New Notification',
        text2: remoteMessage.notification?.body || 'You have a new message',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
    });

    return unsubscribe;
    */
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
            shadowColor: "transparent",
            elevation: 0,
          },
          headerTintColor: COLORS.secondary,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="splash"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="start-inspection"
          options={{
            title: "Start Inspection",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="inspection-details"
          options={{
            title: "Inspection Details",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="inspection-section"
          options={{
            title: "Inspection Section",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="inspection-report"
          options={{
            title: "Inspection Report",
            headerShown: true,
          }}
        />
      </Stack>
      <Toast />
    </>
  );
}
