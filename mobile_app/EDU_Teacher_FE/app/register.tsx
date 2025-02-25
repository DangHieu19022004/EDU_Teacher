import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox";

const RegisterScreen = () => {

  const [isChecked, setChecked] = useState(false);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");

    const validateRegistration = () => {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      const phoneRegex = /^(03|09)\d{8}$/;
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,}$/;

      if (emailRegex.test(email) == false) {
        Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ!");
      } else if (phoneRegex.test(phone) == false) {
        Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ!");
      } else if (passwordRegex.test(password) == false) {
        Alert.alert("Lỗi", "Vui lòng nhập lại mật khẩu hợp lệ!\n\nMật khẩu yêu cầu dài 12 ký tự trở lên và có tối thiểu 1 số và chữ cái in hoa");
      } else if (password != repassword){
        Alert.alert("Lỗi", "Mật khẩu xác nhận lại không chính xác!");
      } else if (isChecked == false){
        Alert.alert("Lỗi", "Vui lòng đồng ý điều khoản của chúng tôi để có thể sử dụng dịch vụ!");
      }
    };

  return (
    <View style={styles.container}>
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
          <TextInput style={styles.input} placeholder="Nhập số điện thoại" value={phone} onChangeText={setPhone}/>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Nhập email" value={email} keyboardType="email-address" onChangeText={setEmail}/>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu *</Text>
          <TextInput style={styles.input} placeholder="Nhập mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Xác nhận mật khẩu *</Text>
          <TextInput style={styles.input} placeholder="Nhập lại mật khẩu" secureTextEntry value={repassword} onChangeText={setRePassword} />
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <Checkbox value={isChecked} onValueChange={setChecked} color={isChecked ? "#2D9CDB" : undefined} />
          <Text style={styles.checkboxLabel}>Tôi đồng ý với những chính sách của nhà phát triển *</Text>
        </View>

        {/* Chú thích */}
        <Text style={styles.note}>(*) Những thông tin bắt buộc phải điền</Text>

        {/* Nút đăng ký */}
        <TouchableOpacity style={styles.button} onPress={validateRegistration}>
          <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
            <Text style={styles.buttonText} >Đăng ký</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Đăng ký với mạng xã hội */}
      <Text style={styles.socialText}>Đăng ký với
      <View style={styles.socialIcons}>
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
