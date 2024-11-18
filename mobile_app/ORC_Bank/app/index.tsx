import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import AppGradient from "@/components/AppGradient";
import Header from "@/components/Header";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import FeatureAll from "@/components/FeatureAll";

const App = () => {
  const router = useRouter();
  return (
    <AppGradient colors={["#fff", "#fff"]}>
      <Header />
      <View className="pt-6">
        <View className="flex-row justify-between pb-4">
          <Text>TÍNH NĂNG</Text>
          <View className="flex-row">
            <EvilIcons name="pencil" size={24} color="black" />
            <Text>Sắp xếp</Text>
          </View>
        </View>
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
      </View>
    </AppGradient>
  );
};

export default App;
