import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SuccessModal from "@/components/SuccessModal";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  headerText: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose, headerText }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    }, 1000);
  };

  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={visible && !success}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>{headerText}</Text>
              <Text style={styles.subtitle}>Nhập mật khẩu hiện tại và mật khẩu mới</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Mật khẩu hiện tại"
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  autoFocus
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
                  placeholder="Xác nhận mật khẩu mới"
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
                    <Text style={styles.submitButtonText}>Thay đổi mật khẩu</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          onClose();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }}
        message="Thay đổi mật khẩu thành công!"
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "80%",
    overflow: "hidden",
  },
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
    fontWeight: "400",
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

export default ChangePasswordModal;
