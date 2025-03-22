import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity, Alert,
  StyleSheet,
  ActivityIndicator, Modal
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';



GoogleSignin.configure({
  webClientId:
    "829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});
const BASE_URL = "http://192.168.1.10:8000/auth";

const RegisterScreen = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [user, setUser] = useState<auth.User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  
  //Đăng ký bằng email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  async function handleRegister() {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Verification code has been sent!");
        setIsCodeSent(true);
      } else {
        Alert.alert("Registration Failed", data.error || "An error occurred");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert("Error", "Cannot connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyCode() {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Verification Successful", "You can now log in!");
        router.replace("/login");
      } else {
        Alert.alert("Verification Error", data.error || "Invalid code");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert("Error", "Cannot connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }
  //Đăng ký bằng email


  async function onGoogleButtonPress() {
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
      // 🔹 Đảm bảo Firebase cập nhật user trước khi lấy thông tin
      await userCredential.user.reload();
      const firebaseUser = userCredential.user;

      console.log("🔥 Firebase User:", firebaseUser);

      if (firebaseUser) {
          const firebaseIdToken = await firebaseUser.getIdToken();
          console.log("🔹 Waiting 2 seconds before sending token...");

          setTimeout(async () => {
              const response = await fetch(`${BASE_URL}/googlelogin/`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: firebaseIdToken }),
              });

              const data = await response.json();
              console.log("📡 Server Response:", data);

              if (data.access_token && response.ok) {
                  await AsyncStorage.setItem("access_token", data.access_token);
                  setUser(firebaseUser);
                  setLoggedIn(true);
              } else {
                  Alert.alert("Login Failed", data.error || "Unknown error occurred.");
              }
              setIsLoading(false);
          }, 2000); // 🔹 Chờ 2 giây trước khi gửi request
      } else {
          Alert.alert("Login Failed", "User data not found.");
          setIsLoading(false); // 🔥 Tắt loading khi lỗi
      }
  } catch (error) {
      console.log("Google Sign-In Error:", error);
      Alert.alert("Google Sign-In Failed", error.message);
      setIsLoading(false); // 🔥 Tắt loading khi lỗi
  }
    // // Sign-in the user with the credential
    // return await auth().signInWithCredential(googleCredential);
  }
  useEffect(() => {
    if (loggedIn && user) {
        router.replace({ pathname: "/home", params: { user: JSON.stringify(user) } });
    }
}, [loggedIn, user]); // 🔹 Điều hướng khi `loggedIn` hoặc `user` thay đổi


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
        {/* Nút quay lại */}
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Tiêu đề */}
        <Text style={styles.title}>Đăng ký</Text>

        {/* Khung chứa form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput style={styles.input} placeholder="Nhập số điện thoại" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Nhập email" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu *</Text>
            <TextInput style={styles.input} placeholder="Nhập mật khẩu" secureTextEntry />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu *</Text>
            <TextInput style={styles.input} placeholder="Nhập lại mật khẩu" secureTextEntry />
          </View>

          {/* Checkbox */}
          <View style={styles.checkboxContainer}>
            <Checkbox value={isChecked} onValueChange={setChecked} color={isChecked ? "#2D9CDB" : undefined} />
            <Text style={styles.checkboxLabel}>Tôi đồng ý với những chính sách của nhà phát triển *</Text>
          </View>

          {/* Chú thích */}
          <Text style={styles.note}>(*) Những thông tin bắt buộc phải điền</Text>

          {/* Nút đăng ký */}
          <TouchableOpacity style={styles.button}>
            <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
              <Text style={styles.buttonText}>Đăng ký</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Đăng ký với mạng xã hội */}
        <Text style={styles.socialText}>Đăng ký với
        <View style={styles.socialIcons}>
          <TouchableOpacity>
            <FontAwesome name="facebook" size={30} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity  onPress={onGoogleButtonPress}>
            <FontAwesome name="google" size={30} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="instagram" size={30} color="#C13584" />
          </TouchableOpacity>
        </View>
        </Text>

        </View>


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
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    borderColor: "#BEBAB3",
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  note: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialText: {
    width: "100%",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    justifyContent: "space-around",
    fontWeight: "bold",
  },
  socialIcons: {
    flexDirection: "row",
    width: "40%",
    justifyContent: "space-around",
  },
  socialIcon: {
    marginHorizontal: 10,
  },
});

export default RegisterScreen;
