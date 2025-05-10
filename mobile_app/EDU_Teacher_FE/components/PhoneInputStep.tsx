import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PhoneInputStepProps {
  onSubmit: (phone: string) => void;
  onClose: () => void;
}

const PhoneInputStep: React.FC<PhoneInputStepProps> = ({ onSubmit, onClose }) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!phone) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    const regex = /^(03|09)\d{8}$/;
    if (!regex.test(phone)) {
      alert("Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng!");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSubmit(phone);
    }, 1000);
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập số điện thoại để nhận mã xác nhận</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Số điện thoại"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoFocus
        />
      </View>

    <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.submitButtonText}>Gửi mã xác nhận</Text>
        )}
      </TouchableOpacity>
    </LinearGradient>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onClose}
      >
        <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  input: {
    height: 45,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 15,
    alignSelf: "center",
  },
  cancelButtonText: {
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

export default PhoneInputStep;
