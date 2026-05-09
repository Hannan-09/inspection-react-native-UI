import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-800 mb-4">
        Inspection App
      </Text>
      <Text className="text-lg text-gray-600 mb-8">
        Welcome to Reecomm Inspection
      </Text>

      <TouchableOpacity
        className="bg-blue-500 px-8 py-4 rounded-lg"
        onPress={() => router.push("/home")}
      >
        <Text className="text-white text-lg font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
