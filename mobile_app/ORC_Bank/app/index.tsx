import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import AppGradient from "@/components/AppGradient";
import Header from "@/components/Header";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FeatureAll from "@/components/FeatureAll";
import AntDesign from "@expo/vector-icons/AntDesign";

const App = () => {
  const router = useRouter();
  return (
    <AppGradient colors={["#fff", "#fff"]}>
      <Header />
      {/* feature */}
      <View className="flex-row justify-between pt-6 pb-4">
        <Text>TÍNH NĂNG</Text>
        <View className="flex-row">
          <EvilIcons name="pencil" size={24} color="black" />
          <Text>Sắp xếp</Text>
        </View>
      </View>
      {/* feature wrap */}
      <View className="flex-row flex-wrap justify-between">
        <FeatureAll />
        <FeatureAll />
        <FeatureAll />
        <FeatureAll />
        <FeatureAll />
        <FeatureAll />
        <FeatureAll />
        <FeatureAll />
      </View>
      {/* show all */}
      <View className="flex-row items-center justify-center pb-4">
        <AntDesign name="down" size={12} color="black" />
        <Text className="ml-1">Xem tất cả</Text>
      </View>
      {/* notification */}
      
    </AppGradient>
  );
  ``;
};

export default App;
