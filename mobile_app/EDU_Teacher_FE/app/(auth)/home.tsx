import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { LoginManager } from 'react-native-fbsdk-next';


const HomeScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            let firebaseUser = auth().currentUser;

            if (params.user) {
                console.log("🔥 User from params:", params.user);
                // Nếu user được truyền qua params từ trang đăng nhập
                const parsedUser = JSON.parse(params.user);
                setUser({
                    displayName: parsedUser.displayName || parsedUser.full_name || "",
                    email: parsedUser.email || "",
                    photoURL: parsedUser.photoURL || parsedUser.providerData?.[0]?.photoURL || parsedUser.avatar || "",
                    phone: parsedUser.phoneNumber || "",
                    uid: parsedUser.uid || "",
                });
            } else if (firebaseUser) {
                // Nếu không có params, lấy user từ Firebase
                await firebaseUser.reload();
                setUser({
                    displayName: firebaseUser.displayName || "",
                    email: firebaseUser.email || "",
                    photoURL: firebaseUser.photoURL || firebaseUser.providerData?.[0]?.photoURL || "",
                    phone: firebaseUser.phoneNumber || "",
                    uid: firebaseUser.uid || "",
                });
            } else {
                router.replace("/login");
            }

            setLoading(false);
        }

        fetchUser();
    }, [params.user]);

    const handleSignOut = async () => {
    try {
        // Kiểm tra nếu user đăng nhập bằng Facebook
        const fbUser = await AsyncStorage.getItem("fb_uid");
        if (fbUser) {
            console.log("Logging out from Facebook...");
            LoginManager.logOut(); // 🔥 Đăng xuất khỏi Facebook
            await AsyncStorage.removeItem("fb_uid"); // 🔥 Xóa dữ liệu Facebook user
        }else{
            // Đăng xuất khỏi Firebase (nếu có)
            await auth().signOut();
            await AsyncStorage.removeItem("access_token"); // 🔥 Xóa token Google/Facebook
        }

        // Điều hướng về màn hình login
        router.replace("/login");
    } catch (error) {
        console.log("Sign-Out Error:", error);
        Alert.alert("Logout Failed", error.message);
    }
};

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4285F4" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={{ color: "red" }}>You are signed in!</Text>
            <Text>{user?.displayName}</Text>
            <Text>{user?.email}</Text>
            {user?.photoURL ? (
                <Image source={{ uri: user?.photoURL }} style={styles.avatar} />
            ) : (
                <Text>No Avatar Available</Text>
            )}
            <Button title="Sign Out" onPress={handleSignOut} />
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginVertical: 10,
    },
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

export default HomeScreen;
