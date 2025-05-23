import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "@/constants/Config";

interface ResetPasswordStepProps {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
  onBack: () => void;
}

const ResetPasswordStep: React.FC<ResetPasswordStepProps> = ({
  email,
  onSuccess,
  onClose,
  onBack,
}) => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}auth/forgot-password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp: code,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        Alert.alert("Lỗi", data.error || "Không thể đặt lại mật khẩu");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gọi API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subtitle}>Mã xác nhận đã được gửi đến {email}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mã xác nhận"
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mật khẩu mới"
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Xác nhận mật khẩu"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <LinearGradient
        colors={["#32ADE6", "#2138AA"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Đặt lại mật khẩu</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.linkText}>← Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.linkText}>Hủy bỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2138AA",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    height: 45,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  linkText: {
    color: "#2F80ED",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  gradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
});

export default ResetPasswordStep;
