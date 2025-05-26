import React from "react";
import { View, Text, Modal, StyleSheet, Image, TouchableWithoutFeedback } from "react-native";

interface ErrorModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string; // Optional custom message
  subMessage?: string; // Optional custom sub-message
}

const ErrorModal = ({ visible, onClose, message = "Không thành công", subMessage = "Vui lòng chụp lại học bạ" }: ErrorModalProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Image source={require("../assets/images/fail-icon.png")} style={styles.image} />
            <Text style={styles.mainText}>{message}</Text>
            <Text style={styles.subText}>{subMessage}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  container: {
    width: 270,
    height: 270,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  mainText: {
    marginTop: 0,
    fontSize: 20,
    fontWeight: "bold",
    color: "#D92D20",
  },
  subText: {
    marginTop: 3,
    fontSize: 16,
    color: "#70798C",
  },
});

export default ErrorModal;
