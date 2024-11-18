import { View, Text, Image } from "react-native";
import React from "react";

const FeatureAll = () => {
  return (
    <View className="rounded-xl bg-yellowwhite w-20 h-20 mb-4">
      <View className="px-3 py-1 items-center justify-center">
        <Image source={require("../assets/images/billIcon.png")} className="size-9"/>
        <Text className="text-center text-sm">Nhập hóa đơn</Text>
      </View>
    </View>
  );
};

export default FeatureAll;
