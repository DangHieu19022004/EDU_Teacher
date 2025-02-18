import React, { useEffect, useState } from "react";
import { View, Button, Text, Image } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";

// OAuth Client ID từ Google Cloud Console
const webClientId = "163331905540-aos31fq7vlbe6309k39vqk4a65u3e13d.apps.googleusercontent.com";
const androidClientId = "163331905540-741d0ajkg0hpr6dh9dcipbvh9io4bfbc.apps.googleusercontent.com";
const iosClientId = "";

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId,
    androidClientId: androidClientId,
    iosClientId: iosClientId,
  });

  useEffect(() => {
    // Load dữ liệu người dùng khi mở app
    const loadUserData = async () => {
      const user = await AsyncStorage.getItem("@user");
      if (user) {
        setUserInfo(JSON.parse(user));
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      handleSigninWithGoogle(response.authentication.accessToken);
    }
  }, [response]);

  async function handleSigninWithGoogle(accessToken:any) {
    try {
      const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }

  return (
    <View>
      <Text>{JSON.stringify(userInfo, null, 2)}</Text>
      <Image
        source={{ uri: userInfo?.picture }}
        style={{ width: 200, height: 200 }}
        resizeMode="contain" // Các tùy chọn khác: cover, stretch, repeat, center
      />
      <Button title="Sign in with Google" onPress={() => promptAsync()} />
      <Button
        title="Sign out"
        onPress={async () => {
          await AsyncStorage.removeItem("@user");
          setUserInfo(null);
        }}
      />
    </View>
  );
};

export default Login;
