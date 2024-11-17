import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import AppGradient from "@/components/AppGradient";
import Header from "@/components/Header";


const App = () => {
  const router = useRouter();
  return (
    <AppGradient colors={["#fff", "#fff"]}>
      <Header>
        
      </Header>
    </AppGradient>
  );
};

export default App;
