import { View } from "react-native";

export function Card({ children, className = "" }) {
  return (
    <View className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
}
