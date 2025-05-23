import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, Image, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/Config";
import { useUser } from "../contexts/UserContext";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";
import LoadingModal from "../../components/LoadingModal";

GoogleSignin.configure({
  webClientId: "829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});

const LoginScreen = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ID, setID] = useState("");
  const [password, setPassword] = useState("");
  const [initializing, setInitializing] = useState(true);
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

  // Kiểm tra lần đầu mở ứng dụng
  const checkFirstAppOpen = async () => {
    try {
      const isFirstOpen = await AsyncStorage.getItem('firstAppOpen');
      if (isFirstOpen === null) {
        // Lần đầu mở ứng dụng, lưu trạng thái và điều hướng đến intro
        await AsyncStorage.setItem('firstAppOpen', 'false');
        router.replace('/(auth)/intro');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking first app open:", error);
      return false;
    }
  };

  useEffect(() => {
    // Kiểm tra lần đầu mở ứng dụng khi màn hình được tải
    checkFirstAppOpen();

    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const validateID = async () => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const phoneRegex = /^(03|09)\d{8}$/;

    if (emailRegex.test(ID) || phoneRegex.test(ID)) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}auth/formlogin/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: ID, password }),
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
          await AsyncStorage.setItem("access_token", data.access_token);

          setUser({
            displayName: data.user.full_name || "",
            email: data.user.email || "",
            photoURL: data.user.avatar || "",
            phone: data.user.phoneNumber || "",
            uid: data.user.uid || "",
          });

          // Điều hướng đến home sau khi đăng nhập
          router.replace('/(main)/home');
        } else {
          Alert.alert("Lỗi", data.error || "Đăng nhập thất bại");
        }
      } catch (error) {
        Alert.alert("Lỗi", "Đã có lỗi xảy ra khi đăng nhập");
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Lỗi", "Vui lòng nhập email hoặc số điện thoại hợp lệ!");
      router.replace('/(main)/home');
    }
  };

  async function onGoogleButtonPress() {
    await AsyncStorage.removeItem("fb_uid");
    await AsyncStorage.removeItem("access_token");
    try {
      setIsLoading(true);
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const googleSignInResult = await GoogleSignin.signIn();
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

        const response = await fetch(`${BASE_URL}auth/googlelogin/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: firebaseIdToken }),
        });

        const data = await response.json();

        if (data.access_token && response.ok) {
          await AsyncStorage.setItem("access_token", data.access_token);

          setUser({
            displayName: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || "",
            phone: firebaseUser.phoneNumber || "",
            uid: firebaseUser.uid || "",
          });

          // Điều hướng đến home sau khi đăng nhập
          router.replace({
            pathname: "/(main)/home",
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
      Alert.alert("Google Sign-In Failed", (error as Error).message);
      setIsLoading(false);
    }
  }

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

      const response = await fetch(`${BASE_URL}auth/facebooklogin/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        await AsyncStorage.setItem("fb_uid", data.access_token);

        setUser({
          displayName: userData.displayName,
          email: data.user.email || "",
          photoURL: userData.photoURL,
          phone: data.user.phoneNumber || "",
          uid: userData.uid,
        });

        // Điều hướng đến home sau khi đăng nhập
        router.replace({
          pathname: "/(main)/home",
          params: { user: JSON.stringify(userData) },
        });
      } else {
        throw new Error(data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Facebook Sign-In Error:", error);
      Alert.alert("Facebook Sign-In Failed", (error as Error).message);
    }
    setIsLoading(false);
  }

  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <ForgotPasswordModal
          visible={forgotPasswordVisible}
          onClose={() => setForgotPasswordVisible(false)}
          headerText="Quên mật khẩu"
        />

        <LoadingModal visible={isLoading} />

        <View style={styles.statusBar}></View>

        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.slogan}>
          Số hóa học bạ, kết nối tri thức, nâng bước tương lai
        </Text>

        <Text style={styles.title}>Đăng nhập</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Email / Số điện thoại"
            style={styles.input}
            value={ID}
            keyboardType="email-address"
            onChangeText={setID}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#888"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setForgotPasswordVisible(true)}>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={validateID}>
          <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.loginText}>Đăng nhập</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.socialContainer}>
          <Text style={styles.orText}>Tiếp tục với</Text>
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

        <View style={styles.line} />

        <Text style={styles.registerText}>Hoặc <TouchableOpacity onPress={() => router.push('/(auth)/register')}><Text style={styles.registerLink}>Đăng ký</Text></TouchableOpacity> </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  statusBar: {
    height: 30,
    backgroundColor: 'white'
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
    paddingTop: 5,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "60%",
  },
  line: {
    width: "80%",
    height: 1,
    backgroundColor: "#000",
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
