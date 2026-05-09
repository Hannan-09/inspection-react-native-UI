import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Card } from "../../components/common/Card";

export default function ProfileTab() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Card className="items-center py-6 mb-4">
          <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">JD</Text>
          </View>
          <Text className="text-xl font-bold text-gray-800">John Doe</Text>
          <Text className="text-gray-600 mt-1">Inspector</Text>
        </Card>

        <Card className="mb-3">
          <TouchableOpacity className="py-3">
            <Text className="text-gray-800 text-base">Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        <Card className="mb-3">
          <TouchableOpacity className="py-3">
            <Text className="text-gray-800 text-base">Settings</Text>
          </TouchableOpacity>
        </Card>

        <Card className="mb-3">
          <TouchableOpacity className="py-3">
            <Text className="text-gray-800 text-base">Help & Support</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <TouchableOpacity className="py-3">
            <Text className="text-red-600 text-base font-semibold">Logout</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}
