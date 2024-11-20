import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from '@expo/vector-icons/AntDesign';

const ModalBill = ({
  isVisible,
  onClose,
}: {
  isVisible: any;
  onClose: any;
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      {/* Lớp nền mờ bên ngoài modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end mb-16">
          {/* Nội dung modal */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="h-1/6 bg-yellowwhite justify-center rounded-t-2xl p-5 border-t-2 border-l-2 border-r-2 border-yellowborder">
              <View className="flex-row space-x-4">
                <TouchableOpacity className="items-center mr-2 p-2 " activeOpacity={0.5}>
                  <Feather name="camera" size={30} color="black"/>
                  <Text className="mt-1">Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center mr-2 p-2 " activeOpacity={0.5}>
                <AntDesign name="file1" size={30} color="black" />
                  <Text className="mt-1">Thiết bị</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center mr-2 p-2 " activeOpacity={0.5}>
                <AntDesign name="form" size={30} color="black" />
                  <Text className="mt-1">Nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center mr-2 p-2 " activeOpacity={0.5}>
                <AntDesign name="questioncircleo" size={30} color="black" />
                  <Text className="mt-1">Hướng dẫn</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalBill;
