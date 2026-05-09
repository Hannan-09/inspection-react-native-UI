import { View, TextInput, Text } from "react-native";

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  className = "",
}) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        className={`bg-white border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg px-4 py-3 text-gray-800`}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
