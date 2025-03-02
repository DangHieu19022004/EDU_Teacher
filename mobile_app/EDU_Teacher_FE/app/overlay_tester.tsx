import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import FailOverlay from "./overlay/failOverlay";

const overlay_tester = () => {
  const [visible, setVisible] = useState(false);

  const showOverlay = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };
  const [overlayVisible, setOverlayVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <Button title="Hiển thị thông báo" onPress={() => setOverlayVisible(true)} color="#3B82F6" />
      <FailOverlay visible={overlayVisible} onClose={() => setOverlayVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
});

export default overlay_tester;
