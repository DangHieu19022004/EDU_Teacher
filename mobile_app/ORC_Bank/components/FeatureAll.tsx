import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";

interface CustomFeature {
  onPress?: () => void;
  imageicon?: string;
  title?: string;
}

const FeatureAll = ({ onPress, imageicon = "", title = "" }: CustomFeature) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="rounded-xl bg-yellowwhite w-20 h-20 mb-4 border-2 border-yellowborder"
      onPress={onPress}
    >
      <View className="px-3 py-1 items-center justify-center">
        <Image
          source={require("../assets/images/billIcon.png")}
          className="size-9"
        />
        <Text className="text-center text-sm">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default FeatureAll;
