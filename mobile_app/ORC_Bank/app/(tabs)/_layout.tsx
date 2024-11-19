import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StatusBar } from "expo-status-bar";

const Tablayout = () => {
  return (

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.tabberOnActive,
          tabBarInactiveTintColor: Colors.tabbarUnactive,
          tabBarStyle: {
            backgroundColor: Colors.tabbarBG,
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="homepage"
          options={{
            tabBarLabel: "Trang chủ",
            tabBarIcon: ({ color }) => (
              <AntDesign name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="setting"
          options={{
            tabBarLabel: "Cài đặt",
            tabBarIcon: ({ color }) => (
              <AntDesign name="setting" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
  );
};

export default Tablayout;
