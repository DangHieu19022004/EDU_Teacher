import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

GoogleSignin.configure({
  webClientId: "829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});
const BASE_URL = "http://192.168.1.164:8000/auth";

const RegisterScreen = () => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [user, setUser] = useState<auth.User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const sendOtpToEmail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        Alert.alert("Thông báo", "Mã OTP đã được gửi đến email của bạn.");
      } else {
        Alert.alert("Lỗi", data.error || "Không thể gửi mã OTP.");
      }
    } catch (error) {
      console.error("OTP error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi mã OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndRegister = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          phone,
          password,
          full_name: fullName,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await handleRegistration(); // tạo tài khoản Firebase
      } else {
        Alert.alert("Lỗi", data.error || "Mã OTP không hợp lệ hoặc đã hết hạn.");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      Alert.alert("Lỗi", "Không thể xác minh mã OTP.");
    } finally {
      setIsLoading(false);
    }
  };


  const validateRegistration = () => {
    const emailRegex = /^$|^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^(03|09)\d{8}$/;
    // const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,}$/;

    if (email && emailRegex.test(email) == false) {
      Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ!");
    } else if (phoneRegex.test(phone) == false) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ!");
    }
    // else if (passwordRegex.test(password) == false) {
    //   Alert.alert("Lỗi", "Vui lòng nhập lại mật khẩu hợp lệ!\n\nMật khẩu yêu cầu dài 12 ký tự trở lên và có tối thiểu 1 số và chữ cái in hoa");
    // }
     else if (password != repassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận lại không chính xác!");
    } else if (isChecked == false) {
      Alert.alert("Lỗi", "Vui lòng đồng ý điều khoản của chúng tôi để có thể sử dụng dịch vụ!");
    } else {
      sendOtpToEmail();
      // handleRegistration();
    }
  };

  const handleRegistration = async () => {
    try {
      setIsLoading(true);
      // Tạo tài khoản với email/password
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Cập nhật số điện thoại
      await userCredential.user.updateProfile({
        displayName: phone
      });

      // Gửi email xác thực
      await userCredential.user.sendEmailVerification();

      Alert.alert("Thành công", "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      router.push('/(auth)/login');
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert("Lỗi", error.message || "Đăng ký không thành công");
    } finally {
      setIsLoading(false);
    }
  };

  async function onGoogleButtonPress() {
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
        const response = await fetch(`${BASE_URL}/googlelogin/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: firebaseIdToken }),
        });

        const data = await response.json();

        if (data.access_token && response.ok) {
          await AsyncStorage.setItem("access_token", data.access_token);
          setUser(firebaseUser);
          setLoggedIn(true);
        } else {
          Alert.alert("Login Failed", data.error || "Unknown error occurred.");
        }
      } else {
        Alert.alert("Login Failed", "User data not found.");
      }
    } catch (error: any) {
      console.log("Google Sign-In Error:", error);
      Alert.alert("Google Sign-In Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (loggedIn && user) {
      router.replace({ pathname: "/home", params: { user: JSON.stringify(user) } });
    }
  }, [loggedIn, user]);

  return (
    <View style={styles.container}>
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

      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text style={styles.title}>Đăng ký</Text>

      {/* Khung chứa form */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>


        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Xác nhận mật khẩu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            value={repassword}
            onChangeText={setRePassword}
            autoCapitalize="none"
          />
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "#32ADE6" : undefined}
          />
          <Text style={styles.checkboxLabel}>Tôi đồng ý với những chính sách của nhà phát triển *</Text>
        </View>

        {/* Gửi mã OTP */}
        {otpSent && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mã OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={verifyOtpAndRegister}>
              <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient}>
                <Text style={styles.buttonText}>Xác minh OTP & Đăng ký</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}


        {/* Chú thích */}
        <Text style={styles.note}>(*) Những thông tin bắt buộc phải điền</Text>

        {/* Nút đăng ký */}
        {!otpSent && (
        <TouchableOpacity style={styles.button} onPress={validateRegistration}>

          <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
            <Text style={styles.buttonText}>Đăng ký</Text>
          </LinearGradient>
        </TouchableOpacity>
        )}

        {/* Đăng ký với mạng xã hội */}
        <View style={styles.socialIcons}>
          <Text style={styles.socialText}>Đăng ký với </Text>
          <TouchableOpacity>
            <FontAwesome name="facebook" style={styles.socialIcon} size={30} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onGoogleButtonPress}>
            <FontAwesome name="google" style={styles.socialIcon} size={30} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="instagram" style={styles.socialIcon} size={30} color="#C13584" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  statusBar: {
    height: 30,
    backgroundColor: 'white'
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
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    paddingTop: 5,
  },
  socialIcons: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  socialIcon: {
    marginHorizontal: 10,
  },
});

export default RegisterScreen;
