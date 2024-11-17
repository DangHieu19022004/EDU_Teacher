import { View, Text, Image } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

const Header = () => {
  return (
    <View
        className="flex-row justify-between items-center pt-2 px-2"
    >
      <Image
        source={require("../assets/images/avartar.png")}
        className="rounded-full w-12 h-12 "
      />
      <View>
        <AntDesign name="search1" size={24} color="black" />
      </View>
    </View>
  );
};

export default Header;
