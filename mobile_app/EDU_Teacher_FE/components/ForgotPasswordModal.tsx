import React, { useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import PhoneInputStep from "./PhoneInputStep";
import ResetPasswordStep from "./ResetPasswordStep";
import SuccessModal from "./SuccessModal";

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setStep(2);
  };

  const handleResetSuccess = () => {
    setSuccessModalVisible(true);
    setTimeout(() => {
      setSuccessModalVisible(false);
      onClose();
      setStep(1);
      setPhoneNumber("");
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
                onSubmit={handlePhoneSubmit}
                onClose={onClose}
              />
            ) : (
              <ResetPasswordStep
                phoneNumber={phoneNumber}
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
