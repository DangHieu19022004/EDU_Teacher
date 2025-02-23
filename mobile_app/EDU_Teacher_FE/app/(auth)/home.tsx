import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import LoginScreen from './login';
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

const HomeScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    // let user = params.user ? JSON.parse(params.user) : null;
    // if(user){
    //     user = {
    //         displayName: user.full_name || user.displayName || "",
    //         email: user.email || user.email || "",
    //         photoURL: user.avatar || user.photoURL || "",
    //         phone: user.phone || user.phone || "",
    //         uid: user.uid || user.uid || "",
    //     }
    // }
    // const handleSignOut = async () => {
    //     try{
    //       await auth()
    //         .signOut()
    //         .then(() => console.log("User signed out!"));
    //       await AsyncStorage.removeItem("access_token");
    //         // return <LoginScreen />
    //         router.replace({ pathname: "/login" });
    //     }catch (error) {
    //       console.log("Sign-Out Error:", error);
    //     }
    //   };
    //   console.log("User Data:", user);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            if (params.user) {
                const parsedUser = JSON.parse(params.user);
                setUser({
                    displayName: parsedUser.displayName || "",
                    email: parsedUser.email || "",
                    photoURL: parsedUser.photoURL || "",
                    phone: parsedUser.phoneNumber || "",
                    uid: parsedUser.uid || "",
                });
            } else {
                const firebaseUser = auth().currentUser;
                if (firebaseUser) {
                    await firebaseUser.reload();
                    setUser(firebaseUser);
                } else {
                    router.replace("/login");
                }
            }
            setLoading(false);
        }

        fetchUser();
    }, [params.user]);

    const handleSignOut = async () => {
        try {
            await auth().signOut();
            await AsyncStorage.removeItem("access_token");
            router.replace("/login");
        } catch (error) {
            console.log("Sign-Out Error:", error);
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
            <Text style={{color: "red"}} >You are signed in!</Text>
            <Text>{user?.displayName}</Text>
            <Text>{user?.email}</Text>
            <Image source={{ uri: user?.photoURL }} style={styles.avatar} />
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
