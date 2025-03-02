import { DarkTheme, DefaultTheme, ThemeProvider, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import LoginScreen from "./login"; // Import màn hình login
import RegisterScreen from "./register"; // Import màn hình register
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  login: undefined;
  register: undefined;
};
const Stack = createStackNavigator<RootStackParamList>();

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
    <NavigationContainer>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="login">
          <Stack.Screen name="login" options={{ headerShown: false }} component={LoginScreen} />
          <Stack.Screen name="register" options={{ headerShown: false }} component={RegisterScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </ThemeProvider>
    </NavigationContainer>
  );
}
