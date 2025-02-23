import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import LoginScreen from './login';
import RegisterScreen from './register';
import HomeScreen from './home';
import { useRouter } from "expo-router";

const BASE_URL = "http://192.168.1.104:8000/auth";

const AuthScreen = () => {
    const router = useRouter();
    const [user, setUser] = useState<auth.User | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        async function checkLoginStatus() {
          const token = await AsyncStorage.getItem("access_token");
          if (token) {
            const response = await fetch(`${BASE_URL}/verify-token/`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
              const userData = await response.json();
              setUser(userData.user);
              setLoggedIn(true);
            } else {
              await AsyncStorage.removeItem("access_token");
              setLoggedIn(false);
            }
          }
        }

        checkLoginStatus();
      }, []);


    function onAuthStateChanged(user) {
        console.log(user);
        setUser(user);
        setLoggedIn(!!user); // Nếu user tồn tại → true, nếu không → false
        if (initializing) setInitializing(false);
      }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
      }, []);

    //   useEffect(() => {
    //     if (loggedIn && user) {
    //         router.replace({ pathname: "/home", params: { user: JSON.stringify(user) } });
    //     }
    // }, [loggedIn, user]); // Chỉ chạy khi `loggedIn` hoặc `user` thay đổi

    useEffect(() => {
      if (!initializing) {
          if (loggedIn && user) {
              router.replace({ pathname: "/home", params: { user: JSON.stringify(user) } });
          } else {
              router.replace("/login");
          }
      }
  }, [loggedIn, user, initializing]);

  // Hiển thị loading trong khi kiểm tra trạng thái đăng nhập
  return (
      <View style={styles.container}>
          <ActivityIndicator size="large" color="#4285F4" />
      </View>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default AuthScreen;
