import { View, Text, ImageBackground, ScrollView, Button } from "react-native";
import Modal from "react-native-modal";
import React, { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import AppGradient from "@/components/AppGradient";
import Header from "@/components/Header";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FeatureAll from "@/components/FeatureAll";
import AntDesign from "@expo/vector-icons/AntDesign";
import NotificationItem from "@/components/NotificationItem";

const Homepage = () => {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal =() => {
    setModalVisible(!isModalVisible);
  }
  
  return (
    <View className="flex-1 bg-white" >
      <View className="flex-1 px-5 py-3">
      <Header />
      {/* feature */}
      <View className="flex-row justify-between pt-6 pb-4">
        <Text className="font-medium">TÍNH NĂNG</Text>
        <View className="flex-row">
          <EvilIcons name="pencil" size={24} color="black" />
          <Text>Sắp xếp</Text>
        </View>
      </View>
      {/* feature wrap */}
      <View className="flex-row flex-wrap justify-between">
        <FeatureAll onPress={toggleModal} title="Điền hóa đơn" />
        <FeatureAll onPress={() => alert('click')} />
        <FeatureAll onPress={() => console.log("clicked")} />
        <FeatureAll onPress={() => console.log("clicked")} />
        <FeatureAll onPress={() => console.log("clicked")} />
        <FeatureAll onPress={() => console.log("clicked")} />
        <FeatureAll onPress={() => console.log("clicked")} />
        <FeatureAll onPress={() => console.log("clicked")} />
      </View>
      {/* show all */}
      <View className="flex-row items-center justify-center pb-4">
        <AntDesign name="down" size={12} color="black" />
        <Text className="ml-1">Xem tất cả</Text>
      </View>
      {/* notification */}
      <View>
        {/* title */}
        <View className="flex-row justify-between mb-2">
          <Text className="font-medium">THÔNG BÁO</Text>
          <Text className="text-blueSky">Xem tất cả</Text>
        </View>
        {/* notification wrap */}
        <ScrollView className="h-5/6">
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
          <NotificationItem />
        </ScrollView>
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text>Hello!</Text>

          <Button title="Hide modal" onPress={toggleModal} />
        </View>
      </Modal>
      </View>
    </View>
  );
};

export default Homepage;
