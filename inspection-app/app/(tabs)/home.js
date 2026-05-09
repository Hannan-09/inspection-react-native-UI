import { View, Text, ScrollView } from "react-native";
import { Card } from "../../components/common/Card";

export default function HomeTab() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Dashboard</Text>

        <View className="flex-row justify-between mb-4">
          <Card className="flex-1 mr-2">
            <Text className="text-gray-600 text-sm">Total Inspections</Text>
            <Text className="text-3xl font-bold text-blue-600 mt-2">24</Text>
          </Card>

          <Card className="flex-1 ml-2">
            <Text className="text-gray-600 text-sm">Pending</Text>
            <Text className="text-3xl font-bold text-orange-600 mt-2">8</Text>
          </Card>
        </View>

        <Card>
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Recent Activity
          </Text>
          <Text className="text-gray-600">No recent inspections</Text>
        </Card>
      </View>
    </ScrollView>
  );
}
