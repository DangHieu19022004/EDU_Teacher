import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

const BASE_URL = "http://192.168.1.244:8000/auth";

const AuthScreen = () => {
    const router = useRouter();
    const [user, setUser] = useState<auth.User | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
      async function checkLoginStatus() {
          try {
              const token = await AsyncStorage.getItem("access_token");
              if (token) {
                  console.log("🔹 Checking Google token...", token);
                  const response = await fetch(`${BASE_URL}/verify-token/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                      body: JSON.stringify({}),
                  });

                  if (response.ok) {
                      const userData = await response.json();
                      console.log("✅ Google User authenticated:", userData);
                      setUser(userData.user);
                      setLoggedIn(true);

                      router.replace({ pathname: "/home", params: { user: JSON.stringify(userData.user) } });
                    //   if (loggedIn && user) {
                    //     router.replace({ pathname: "/home", params: { user: JSON.stringify(user) } });
                    // } else {
                    //     router.replace("/login");
                    // }

                      return;
                  } else {
                      await AsyncStorage.removeItem("access_token");
                  }
              }

              const fb_uid = await AsyncStorage.getItem("fb_uid");
              if (fb_uid) {
                  console.log("📌 Checking Facebook user:", fb_uid);

                  // 🛠 ĐẢM BẢO `fb_uid` ĐƯỢC GỬI ĐÚNG
                  const fbCheckResponse = await fetch(`${BASE_URL}/verify-token/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "Authorization": `Facebook ${fb_uid}` },
                      body: JSON.stringify({}),
                  });

                  console.log("📌 Sent fb_uid to backend:", fb_uid);

                  if (fbCheckResponse.ok) {
                      const fbUserData = await fbCheckResponse.json();
                      console.log("✅ Facebook verify response:", fbUserData.user);
                      setUser(fbUserData.user);
                      setLoggedIn(true);


                    router.replace({ pathname: "/home", params: { user: JSON.stringify(fbUserData.user) } });


                      return;
                  } else {
                      console.log("❌ Facebook verification failed");
                      await AsyncStorage.removeItem("fb_uid");
                  }
              }

              setLoggedIn(false);
              router.replace({ pathname: "/login"});
          } catch (error) {
              console.error("Login Check Error:", error);
              setLoggedIn(false);
          }
      }

      checkLoginStatus();
  }, []);



//   useEffect(() => {
//       if (!initializing) {
//           console.log("📌 Checking navigation condition:", { loggedIn, user });

//           if (loggedIn && user) {
//               router.replace({ pathname: "/home", params: { user: JSON.stringify(user) } });
//           } else {
//               router.replace("/login");
//           }
//       }
//   }, [loggedIn, user, initializing]);



    function onAuthStateChanged(user: auth.User | null) {
        setUser(user);
        setLoggedIn(!!user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // Unsubscribe on unmount
    }, []);

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
});

export default AuthScreen;
