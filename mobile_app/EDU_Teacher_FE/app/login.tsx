import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);  

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={{ uri: "https://drive.google.com/uc?export=view&id=1f7U7-bKcKwnEoqLY4RCCU7-1pK2s02R4" }} 
        style={styles.logo} 
      />
      <Text style={styles.slogan}>
        Số hóa học bạ, kết nối tri thức, nâng bước tương lai
      </Text>     

      {/* Form đăng nhập */}
      <Text style={styles.title}>Đăng nhập</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
        <TextInput placeholder="Email / Số điện thoại" style={styles.input} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
        <TextInput placeholder="Mật khẩu" secureTextEntry={!showPassword} style={styles.input} />
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
      <TouchableOpacity style={styles.loginButton}>
        <LinearGradient colors={["#2D9CDB", "#2F80ED"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
          <Text style={styles.loginText}>Đăng nhập</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Đăng nhập bằng mạng xã hội */}
      <Text style={styles.orText}>Tiếp tục với
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <FontAwesome name="facebook" size={30} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity>
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
      <Text style={styles.registerText}>Hoặc <TouchableOpacity><Text style={styles.registerLink}>Đăng ký</Text></TouchableOpacity> </Text> 
      
    </View>
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