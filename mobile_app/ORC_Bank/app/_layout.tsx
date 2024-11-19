// Import your global CSS file
import "../global.css";

import { Slot, SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import React from "react";

// prevent the splash screen from auto hiding until load all the font assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Roboto-Mono": require("../assets/fonts/RobotoMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
    NavigationBar.setBackgroundColorAsync("#1e293b"); 
    NavigationBar.setButtonStyleAsync("light"); 
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;
  if (!fontsLoaded && !error) return null;




  return (

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, statusBarStyle: 'dark' }} />
        <Stack.Screen name="index" options={{ headerShown: false,  statusBarStyle: 'dark' }} />
      </Stack>

  );
}
