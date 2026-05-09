import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { inspectionAPI } from "../../services/api/inspectionAPI";

export default function InspectionsTab() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await inspectionAPI.getAll();
      setInspections(data);
    } catch (error) {
      console.error("Error loading inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderInspection = ({ item }) => (
    <TouchableOpacity className="mb-3">
      <Card>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {item.title}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">{item.location}</Text>
            <Text className="text-xs text-gray-500 mt-1">{item.date}</Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              item.status === "completed" ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                item.status === "completed"
                  ? "text-green-700"
                  : "text-orange-700"
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={inspections}
        renderItem={renderInspection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-lg">No inspections found</Text>
          </View>
        }
      />
    </View>
  );
}
