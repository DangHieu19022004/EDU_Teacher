import React from "react";
import { View, Text, Modal, StyleSheet, Image, TouchableWithoutFeedback } from "react-native";

const SuccessOverlay = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Image source={require("../../../../assets/images/success-overlay.png")} style={styles.image} />
            <Text style={styles.text}>Lưu học bạ thành công</Text>
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
  text: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
  },
});

export default SuccessOverlay;
