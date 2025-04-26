import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useUser } from "../contexts/UserContext";

const BASE_URL = "http://192.168.1.164:8000/auth";

const AuthScreen = () => {
    const router = useRouter();
    const { setUser } = useUser();
    const [loggedIn, setLoggedIn] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

    useEffect(() => {
        // Kiểm tra lần đầu khởi chạy app
        async function checkFirstLaunch() {
            try {
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');
                if (hasLaunched === null) {
                    await AsyncStorage.setItem('hasLaunched', 'true');
                    setIsFirstLaunch(true);
                } else {
                    setIsFirstLaunch(false);
                }
            } catch (error) {
                console.error("Error checking first launch:", error);
                setIsFirstLaunch(false);
            }
        }

        checkFirstLaunch();
    }, []);

    useEffect(() => {
        if (isFirstLaunch === null) return;

        if (isFirstLaunch) {
            router.replace('/(auth)/intro');
            return;
        }

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
                        setUser({
                              displayName: userData.user.full_name || userData.user.displayName || "",
                              email: userData.user.email || "",
                              photoURL: userData.user.photoURL || userData.user.providerData?.[0]?.photoURL || userData.user.avatar ||"",
                              phone: userData.user.phoneNumber || "",
                              uid: userData.user.uid || "",
                        });
                        setLoggedIn(true);
                        router.replace('/(main)/home');
                        return;
                    } else {
                        await AsyncStorage.removeItem("access_token");
                    }
                }

                const fb_uid = await AsyncStorage.getItem("fb_uid");
                if (fb_uid) {
                    console.log("📌 Checking Facebook user:", fb_uid);
                    const fbCheckResponse = await fetch(`${BASE_URL}/verify-token/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Facebook ${fb_uid}` },
                        body: JSON.stringify({}),
                    });

                    console.log("📌 Sent fb_uid to backend:", fb_uid);

                    if (fbCheckResponse.ok) {
                        const fbUserData = await fbCheckResponse.json();
                        console.log("✅ Facebook verify response:", fbUserData.user);
                        setUser({
                          displayName: fbUserData.user.full_name || fbUserData.user.displayName || "",
                          email: fbUserData.user.email || "",
                          photoURL: fbUserData.user.photoURL || fbUserData.user.providerData?.[0]?.photoURL || fbUserData.user.avatar || "",
                          phone: fbUserData.user.phoneNumber || "",
                          uid: fbUserData.user.uid || "",
                        })
                        setLoggedIn(true);
                        router.replace('/(main)/home');
                        return;
                    } else {
                        console.log("❌ Facebook verification failed");
                        await AsyncStorage.removeItem("fb_uid");
                    }
                }

                setLoggedIn(false);
                router.replace('/(auth)/login');
            } catch (error) {
                console.error("Login Check Error:", error);
                setLoggedIn(false);
                router.replace('/(auth)/login');
            }
        }

        checkLoginStatus();
    }, [isFirstLaunch]);

    function onAuthStateChanged(user: auth.User | null) {
        setUser(user);
        setLoggedIn(!!user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // Unsubscribe on unmount
    }, []);

    if (isFirstLaunch === null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4285F4" />
            </View>
        );
    }

    return null;
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
