import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, Image, StyleSheet, Modal } from "react-native";
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";

GoogleSignin.configure({
  webClientId:
    "829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});
const BASE_URL = "http://192.168.1.10:8000/auth";

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<auth.User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function onGoogleButtonPress() {
      await AsyncStorage.removeItem("fb_uid");
      await AsyncStorage.removeItem("access_token");
      try{
        setIsLoading(true); // 🔥 Hiển thị loading
        // Check if your device supports Google Play
        await GoogleSignin.signOut();
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const googleSignInResult = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(
          googleSignInResult.data?.idToken ?? null
        );

        const userCredential = await auth().signInWithCredential(googleCredential);


        await userCredential.user.reload();
        const firebaseUser = userCredential.user;

        console.log("Firebase User:", firebaseUser);

        if (firebaseUser) {
            const firebaseIdToken = await firebaseUser.getIdToken();
            console.log("Firebase Token:", firebaseIdToken);

            const response = await fetch(`${BASE_URL}/googlelogin/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: firebaseIdToken }),
            });

            const data = await response.json();

            if (data.access_token && response.ok) {
                await AsyncStorage.setItem("access_token", data.access_token);

                // 🔹 Truyền thông tin user chính xác
                router.replace({
                    pathname: "/home",
                    params: { user: JSON.stringify(firebaseUser) }
                });
            } else {
                Alert.alert("Login Failed", data.message || "Unknown error occurred.");
            }
            setIsLoading(false);
        } else {
            Alert.alert("Login Failed", "User data not found.");
            setIsLoading(false);
        }
    } catch (error) {
        console.log("Google Sign-In Error:", error);
        Alert.alert("Google Sign-In Failed", error.message);
        setIsLoading(false);
    }

      //   const firebaseIdToken = await userCredential.user.getIdToken();
      //   console.log("Firebase Token:", firebaseIdToken);

      //   const response = await fetch(`${BASE_URL}/googlelogin/`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ token: firebaseIdToken }),
      //   });

      //   const data = await response.json();
      //   // console.log("Response from Backend:", data);

      //   if (data.access_token && response.ok) {
      //     await AsyncStorage.setItem("access_token", data.access_token); // Lưu token để duy trì đăng nhập

      //     // Lấy thông tin user từ Firebase
      //     const currentUser = auth().currentUser;
      //     if (currentUser) {
      //       setUser(currentUser);
      //       setLoggedIn(true);

      //       // CHUYỂN ĐẾN HOMESCREEN
      //       router.push({ pathname: "/home", params: { user: JSON.stringify(user) } });
      //       // return <HomeScreen user={currentUser} />

      //     }

      //   }else{
      //     Alert.alert("Login Failed", data.message || "Unknown error occurred.");
      //   }
      // } catch (error) {
      //   console.log("Google Sign-In Error:", error);
      //   Alert.alert("Google Sign-In Failed", (error as Error).message);
      // }
      // // Sign-in the user with the credential
      // return await auth().signInWithCredential(googleCredential);
    }

    const handleFormSubmit = () => {
      try{
        let userCredential;
          userCredential = auth()
            .signInWithEmailAndPassword(email, password)
            .then((val) => console.log(val))
            .catch((err) => console.log(err));
          console.log("Signing In with:", { email, password });
        // Simulate login
        setLoggedIn(true);
      } catch (error) {
        console.log("Auth Error:", error);
        Alert.alert("Authentication Failed", (error as Error).message);
      }

    };

    //facebook login
    // Handle user state changes
    function onAuthStateChanged(user : any) {
      setUser(user);
      if (initializing) setInitializing(false);
    }

    useEffect(() => {
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
      return subscriber; // unsubscribe on unmount
    }, []);

    async function onFacebookButtonPress() {
      await AsyncStorage.removeItem("fb_uid");
      await AsyncStorage.removeItem("access_token");
      try {
          setIsLoading(true);

          const result = await LoginManager.logInWithPermissions(["public_profile"]);
          if (result.isCancelled) throw new Error("User cancelled the login process");

          const fbData = await AccessToken.getCurrentAccessToken();
          if (!fbData) throw new Error("Failed to get Facebook access token");

          const fbResponse = await fetch(
              `https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${fbData.accessToken}`
          );
          const fbUserData = await fbResponse.json();

          console.log("✅ Facebook User Data:", fbUserData);

          if (!fbUserData.id || !fbUserData.name || !fbUserData.picture?.data?.url) {
              throw new Error("Incomplete user data received from Facebook");
          }

          const userData = {
              uid: fbUserData.id,
              displayName: fbUserData.name,
              photoURL: fbUserData.picture.data.url,
          };

          const response = await fetch(`${BASE_URL}/facebooklogin/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
          await AsyncStorage.setItem("fb_uid", data.access_token);

          setTimeout(() => {
              router.replace({
                  pathname: "/home",
                  params: { user: JSON.stringify(userData) },
              });
          }, 500);
      } else {
          throw new Error(data.error || "Login failed.");
      }

      } catch (error) {
          console.error("Facebook Sign-In Error:", error);
          Alert.alert("Facebook Sign-In Failed", error.message);
      }
      setIsLoading(false);
  }




  return (
      <View style={styles.container}>
       {/* 🔥 Modal hiển thị trạng thái đăng ký */}
              <Modal
                transparent
                animationType="fade"
                visible={isLoading}
                onRequestClose={() => setIsLoading(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <ActivityIndicator size="large" color="#2D9CDB" />
                    <Text style={styles.loadingText}>Đang đăng ký bằng Google...</Text>
                  </View>
                </View>
              </Modal>
        {/* Logo */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.slogan}>
          Số hóa học bạ, kết nối tri thức, nâng bước tương lai
        </Text>

        {/* Form đăng nhập */}
        <Text style={styles.title}>Đăng nhập</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
          <TextInput placeholder="Email / Số điện thoại" style={styles.input} value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none" />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
          <TextInput placeholder="Mật khẩu" secureTextEntry={!showPassword} style={styles.input} value={password}
        onChangeText={setPassword} autoCapitalize="none"/>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20} color="#888"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {/* Button Đăng nhập */}
        <TouchableOpacity style={styles.loginButton} onPress={handleFormSubmit}>
          <LinearGradient colors={["#2D9CDB", "#2F80ED"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
            <Text style={styles.loginText}>Đăng nhập</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Đăng nhập bằng mạng xã hội */}
        <Text style={styles.orText}>Tiếp tục với
        <View style={styles.socialContainer}>
          <TouchableOpacity onPress={onFacebookButtonPress}>
            <FontAwesome name="facebook" size={30} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onGoogleButtonPress}>
            <FontAwesome name="google" size={30} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="instagram" size={30} color="#C13584" />
          </TouchableOpacity>
        </View>

        </Text>

        {/* Đường kẻ ngang trên nút "Đăng ký" */}
        <View style={styles.line} />

        {/* Đăng ký */}
        <Text style={styles.registerText}>Hoặc <TouchableOpacity onPress={() => router.push("/register")}><Text style={styles.registerLink}>Đăng ký</Text></TouchableOpacity> </Text>

      </View>
    );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 🔥 Làm mờ nền
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2D9CDB",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    marginBottom: 10,
  },
  slogan: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginLeft: "auto",
  },
  input: {
    flex: 1,
    height: 45,
  },
  forgotPassword: {
    marginLeft: "60%",
    color: "#2F80ED",
    marginVertical: 10,
    textDecorationLine: "underline",
  },
  loginButton: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
  line: {
    width: "80%",
    height: 1,
    backgroundColor: "#000",  // Màu đen cho đường kẻ
    marginVertical: 10,
  },
  registerText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },
  registerLink: {

    marginLeft: 0,
    marginBottom: -4,
    color: "#2F80ED",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
