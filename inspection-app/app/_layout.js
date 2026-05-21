import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import "../global.css";
import { COLORS } from "../constants";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.fourth,
          },
          headerTintColor: COLORS.primary,
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
