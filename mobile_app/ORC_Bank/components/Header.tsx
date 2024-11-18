import { View, Text, Image } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

const Header = () => {
  return (
    <View className="flex-row justify-between items-center pt-2 px-2">
      <View className="flex-row">
        <Image
          source={require("../assets/images/avartar.png")}
          className="rounded-full w-12 h-12 "
        />
        <View className="pl-4">
          <Text className="text-roleColorGray text-sm ">Nhân viên</Text>
          <Text className="text-lg">Lê Thị Đào</Text>
        </View>
      </View>
      <View>
        <AntDesign name="search1" size={24} color="black" />
      </View>
    </View>
  );
};

export default Header;
