import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'expo-dev-client';

import { Stack } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from './contexts/UserContext';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="index" /> */}
        <Stack.Screen name="(auth)" />
        {/* <Stack.Screen name="(tabs)" /> */}
        <Stack.Screen name="(main)" />
        {/* <Stack.Screen name="main/mainScreen" />
        <Stack.Screen name="main/home" />
        <Stack.Screen name="main/infostudent" />
        <Stack.Screen name="main/setting" />
        <Stack.Screen name="features/scanning/studentReportCard" />
        <Stack.Screen name="features/scanning/photoCapture" /> */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </GestureHandlerRootView>
    </UserProvider>
  );
}
  // GoogleSignin.configure({
  //   webClientId: '829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com',
  // });
// sha1__android: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
// https://www.youtube.com/watch?v=QN1y8FgONBo
