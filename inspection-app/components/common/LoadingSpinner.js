import { View, ActivityIndicator, Text } from "react-native";
import { COLORS } from "../../constants";

export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color={COLORS.fourth} />
      <Text className="text-gray-600 mt-4">{message}</Text>
    </View>
  );
}
