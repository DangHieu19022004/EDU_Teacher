import { View, Text, ImageBackground, ScrollView } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import { Redirect, useRouter } from "expo-router";
import AppGradient from "@/components/AppGradient";
import Header from "@/components/Header";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FeatureAll from "@/components/FeatureAll";
import AntDesign from "@expo/vector-icons/AntDesign";
import NotificationItem from "@/components/NotificationItem";

const App = () => {
  const router = useRouter();
  return <Redirect href="/(tabs)/homepage" />;
};

export default App;
