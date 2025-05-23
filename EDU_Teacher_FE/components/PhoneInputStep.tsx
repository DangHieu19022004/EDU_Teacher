import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "@/constants/Config";

interface PhoneInputStepProps {
  onSubmit: (email: string) => void;
  onClose: () => void;
  headerText: string;
}

const PhoneInputStep: React.FC<PhoneInputStepProps> = ({ onSubmit, onClose, headerText }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}auth/forgot-password-send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", "Đã gửi mã OTP đến email.");
        onSubmit(email); // sang bước nhập OTP và mật khẩu mới
      } else {
        Alert.alert("Lỗi", data.error || "Không thể gửi OTP.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>{headerText}</Text>
      <TextInput
        placeholder="Nhập email"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <LinearGradient
        colors={["#32ADE6", "#2138AA"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={handleSendOtp} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Gửi mã OTP</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <TouchableOpacity onPress={onClose} style={{ marginTop: 15 }}>
        <Text style={styles.cancel}>Hủy</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { padding: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  gradient: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancel: {
    textAlign: "center",
    color: "#2F80ED",
    textDecorationLine: "underline",
  },
});

export default PhoneInputStep;
