import { View, ActivityIndicator, Text } from "react-native";

export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#f4511e" />
      <Text className="text-gray-600 mt-4">{message}</Text>
    </View>
  );
}
