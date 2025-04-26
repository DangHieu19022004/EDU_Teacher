import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, Image, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";


GoogleSignin.configure({
  webClientId: "829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});
const BASE_URL = "http://192.168.1.164:8000/auth";

const LoginScreen = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ID, setID] = useState("");
  const [password, setPassword] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<auth.User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // const [isOTPMode, setIsOTPMode] = useState(false);       // bật/tắt chế độ OTP
  // const [phoneNumber, setPhoneNumber] = useState("");       // lưu số điện thoại
  // const [confirmation, setConfirmation] = useState(null);   // đối tượng xác minh
  // const [otpCode, setOtpCode] = useState("");               // mã OTP nhập từ người dùng

  // const sendOTP = async () => {
  //   try {
  //     setIsLoading(true);

  //     let input = ID.trim().replace(/\s+/g, "");

  //     // Nếu người dùng nhập 032xxxxxxx → tự đổi thành +8432xxxxxxx
  //     if (input.startsWith("0")) {
  //       input = "+84" + input.slice(1);
  //     }

  //     // Nếu không có +84 hoặc không đúng định dạng
  //     const regex = /^\+84[1-9][0-9]{8}$/;
  //     if (!regex.test(input)) {
  //       Alert.alert("Lỗi", "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng!");
  //       setIsLoading(false);
  //       return;
  //     }

  //     const confirm = await auth().signInWithPhoneNumber(input);
  //     setConfirmation(confirm);
  //     Alert.alert("Thông báo", "OTP đã được gửi về số điện thoại!");
  //   } catch (error) {
  //     Alert.alert("Lỗi gửi OTP", error.message);
  //     console.error("OTP Error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const verifyOTP = async () => {
  //   try {
  //     setIsLoading(true);
  //     await confirmation.confirm(otpCode);

  //     const firebaseUser = auth().currentUser;
  //     const token = await firebaseUser.getIdToken();

  //     await AsyncStorage.setItem("access_token", token);

  //     const isFirstTime = await checkFirstTimeLogin(firebaseUser.uid);
  //     if (isFirstTime) {
  //       router.replace("/(auth)/intro");
  //     } else {
  //       router.replace("/(main)/home");
  //     }
  //   } catch (error) {
  //     Alert.alert("Lỗi xác minh", "Mã OTP sai hoặc đã hết hạn.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



  // Kiểm tra xem đây có phải là lần đăng nhập đầu tiên không
  const checkFirstTimeLogin = async (userId: string) => {
    try {
      const firstTimeKey = `firstTime_${userId}`;
      const isFirstTime = await AsyncStorage.getItem(firstTimeKey);

      if (isFirstTime === null) {
        // Đây là lần đăng nhập đầu tiên
        await AsyncStorage.setItem(firstTimeKey, 'false');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking first time login:", error);
      return false;
    }
  };

  // Validate ID (email or phone number)
  const validateID = async () => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const phoneRegex = /^(03|09)\d{8}$/;

    if (emailRegex.test(ID) || phoneRegex.test(ID)) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/formlogin/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: ID, password }),
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
          await AsyncStorage.setItem("access_token", data.access_token);

          const isFirstTime = await checkFirstTimeLogin(data.user.uid);

          if (isFirstTime) {
            router.replace('/(auth)/intro');
          } else {
            router.replace('/(main)/home');
          }
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
    }
  };


  // Google Sign-In
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

        const response = await fetch(`${BASE_URL}/googlelogin/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: firebaseIdToken }),
        });

        const data = await response.json();

        if (data.access_token && response.ok) {
          await AsyncStorage.setItem("access_token", data.access_token);

          // Kiểm tra lần đầu đăng nhập
          const isFirstTime = await checkFirstTimeLogin(firebaseUser.uid);

          if (isFirstTime) {
            router.replace('/(auth)/intro');
          } else {
            router.replace({
              pathname: "/(main)/home",
              params: { user: JSON.stringify(firebaseUser) }
            });
          }
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

  // Facebook Login
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

        // Kiểm tra lần đầu đăng nhập
        const isFirstTime = await checkFirstTimeLogin(userData.uid);

        setTimeout(() => {
          if (isFirstTime) {
            router.replace('/(auth)/intro');
          } else {
            router.replace({
              pathname: "/(main)/home",
              params: { user: JSON.stringify(userData) },
            });
          }
        }, 500);
      } else {
        throw new Error(data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Facebook Sign-In Error:", error);
      Alert.alert("Facebook Sign-In Failed", (error as Error).message);
    }
    setIsLoading(false);
  }

  // Handle auth state changes
  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Loading Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => setIsLoading(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#32ADE6" />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        </View>
      </Modal>

      {/* Status Bar */}
      <View style={styles.statusBar}></View>

      {/* Logo */}
      <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
      <Text style={styles.slogan}>
        Số hóa học bạ, kết nối tri thức, nâng bước tương lai
      </Text>


      {/* Chế độ OTP */}
      {/* <TouchableOpacity onPress={() => setIsOTPMode(!isOTPMode)}>
        <Text style={{ color: "#2F80ED", marginVertical: 10, fontWeight: "bold" }}>
          {isOTPMode ? "← Quay lại đăng nhập Email/SĐT" : "Đăng nhập bằng SĐT + OTP"}
        </Text>
      </TouchableOpacity> */}







      {/* Form đăng nhập */}
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

{/* {isOTPMode && confirmation && (
  <View style={styles.inputContainer}>
    <Ionicons name="keypad-outline" size={20} color="#888" style={styles.icon} />
    <TextInput
      placeholder="Nhập mã OTP"
      value={otpCode}
      onChangeText={setOtpCode}
      keyboardType="number-pad"
      style={styles.input}
      blurOnSubmit={false}
    />
  </View>
)} */}


      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Button Đăng nhập */}
      <TouchableOpacity style={styles.loginButton} onPress={validateID}>
        <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
          <Text style={styles.loginText}>Đăng nhập</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Đăng nhập bằng mạng xã hội */}
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

      {/* Đường kẻ ngang trên nút "Đăng ký" */}
      <View style={styles.line} />

      {/* Đăng ký */}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#32ADE6",
    fontWeight: "bold",
  },
});

export default LoginScreen;
