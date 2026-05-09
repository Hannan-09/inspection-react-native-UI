import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}) {
  const variants = {
    primary: "bg-blue-500",
    secondary: "bg-gray-500",
    success: "bg-green-500",
    danger: "bg-red-500",
  };

  const textVariants = {
    primary: "text-white",
    secondary: "text-white",
    success: "text-white",
    danger: "text-white",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${variants[variant]} px-6 py-3 rounded-lg items-center justify-center ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`${textVariants[variant]} font-semibold text-base`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
