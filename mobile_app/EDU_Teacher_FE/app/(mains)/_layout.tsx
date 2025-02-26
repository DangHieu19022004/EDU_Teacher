import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme, Platform } from 'react-native';



// Ngăn splash screen tự động ẩn trước khi tải tài nguyên
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          headerShown: false, // Ẩn header mặc định
          tabBarStyle: {
            height: Platform.OS === 'web' ? 60 : 56, // Điều chỉnh cho web và mobile
            backgroundColor: '#F3F4F6',
            borderTopWidth: 1,
            borderTopColor: '#D1D5DB',
            paddingBottom: Platform.OS === 'web' ? 8 : 0,
          },
          tabBarActiveTintColor: 'blue', // Màu khi tab được chọn
          tabBarInactiveTintColor: 'gray', // Màu khi tab không được chọn
          tabBarLabelStyle: {
            fontSize: 12, // Kích thước văn bản trong tab
          },
        }}
      >
        <Tabs.Screen
          name="index" // Màn hình Trang chủ (home.tsx)
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile" // Màn hình Bản thân (student.tsx)
          options={{
            title: 'Bản thân',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings" // Màn hình Cài đặt (setting.tsx)
          options={{
            title: 'Cài đặt',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="cog" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}