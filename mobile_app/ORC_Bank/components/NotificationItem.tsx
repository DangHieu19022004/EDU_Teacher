import { View, Text, Image } from "react-native";
import React from "react";

const NotificationItem = ({imageNotification}: any) => {
  return (
    <View className="flex-row justify-between w-full items-center mb-2">
      <Image
        source={require("../assets/images/avartar.png")}
        className="size-12"
      />
      <View className="flex-1 ml-4">
        <Text>Lịch nghỉ lễ</Text>
        <Text className="text-roleColorGray text-sm">Từ 1/1/2024 - 1/2/2025</Text>
      </View>
    </View>
  );
};

export default NotificationItem;
