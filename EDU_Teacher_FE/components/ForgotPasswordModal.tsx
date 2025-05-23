import React, { useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import PhoneInputStep from "./PhoneInputStep";
import ResetPasswordStep from "./ResetPasswordStep";
import SuccessModal from "./SuccessModal";

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  headerText: string; // Thêm headerText vào props
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onClose, headerText }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(""); // đổi từ phoneNumber sang email
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleEmailSubmit = (enteredEmail: string) => {
    setEmail(enteredEmail);
    setStep(2);
  };

  const handleResetSuccess = () => {
    setSuccessModalVisible(true);
    setTimeout(() => {
      setSuccessModalVisible(false);
      onClose();
      setStep(1);
      setEmail("");
    }, 2000);
  };

  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {step === 1 ? (
              <PhoneInputStep
                onSubmit={handleEmailSubmit}
                onClose={onClose}
                headerText={headerText}
              />
            ) : (
              <ResetPasswordStep
                email={email}
                onSuccess={handleResetSuccess}
                onClose={onClose}
                onBack={() => setStep(1)}
              />
            )}
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        message="Đặt lại mật khẩu thành công!"
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
});

export default ForgotPasswordModal;
