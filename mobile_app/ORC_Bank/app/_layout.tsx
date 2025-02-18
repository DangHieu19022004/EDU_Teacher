
// Import your global CSS file
import "../global.css";


import { Slot, SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Tabs } from 'expo-router'
import { StatusBar } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { NavigationContainer } from '@react-navigation/native';

// prevent the splash screen from auto hiding until load all the font assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Roboto-Mono": require("../assets/fonts/RobotoMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;
  if (!fontsLoaded && !error) return null;

      // Đặt màu và kiểu cho thanh điều hướng Android
      NavigationBar.setBackgroundColorAsync("#1e293b"); // Màu nền
      NavigationBar.setButtonStyleAsync("light"); // Nút sáng trên nền tối

  return (
      <Stack>
        {/* Các màn hình con */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false, statusBarStyle: 'dark', statusBarBackgroundColor: '#fff' }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="(modal)/ModalBill" options={{ headerShown: false, presentation: 'modal' }}/>
        <Stack.Screen name="(modal)/BillScreen" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="(modal)/ModalReceipt" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
  );
}
