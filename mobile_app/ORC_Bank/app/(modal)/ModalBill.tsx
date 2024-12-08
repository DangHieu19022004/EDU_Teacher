import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";

const ModalBill = ({
  isVisible,
  onClose,
}: {
  isVisible: any;
  onClose: any;
}) => {
  const navigation = useNavigation<any>();

  const openCamera = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (!mediaPermission.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Vui lòng cấp quyền truy cập thư viện ảnh."
        );
        return;
      }

      // Mở camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const photoUri = result.assets[0].uri;

        // Lưu ảnh vào thư viện (tuỳ chọn, nếu cần)
        await MediaLibrary.createAssetAsync(photoUri);

        // Chuyển hướng sang trang hiển thị ảnh
        navigation.navigate("(modal)/BillScreen", { photoUri });
      }
    } catch (error) {
      console.error("Lỗi khi mở camera hoặc lưu ảnh:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chụp hoặc lưu ảnh.");
    }
  };

  const openGallery = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (!mediaPermission.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Vui lòng cấp quyền truy cập thư viện ảnh."
        );
        return;
      }

      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const photoUri = result.assets[0].uri;

        // // Lưu ảnh vào thư viện (tuỳ chọn, nếu cần)
        // await MediaLibrary.createAssetAsync(photoUri);

        // Chuyển hướng sang trang hiển thị ảnh
        navigation.navigate("(modal)/BillScreen", { photoUri });
      }
    } catch (error) {
      console.error("Lỗi khi mở thư viện ảnh hoặc lưu ảnh:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh hoặc lưu ảnh.");
    }
  };

  const openFormReceipt = () => {
    navigation.navigate("(modal)/BillScreen");
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      {/* Lớp nền mờ bên ngoài modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end mb-16">
          {/* Nội dung modal */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="h-1/6 bg-yellowwhite justify-center rounded-t-2xl p-5 border-t-2 border-l-2 border-r-2 border-yellowborder">
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={openCamera}
                  className="items-center mr-2 p-2 "
                  activeOpacity={0.5}
                >
                  <Feather name="camera" size={30} color="black" />
                  <Text className="mt-1">Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openGallery}
                  className="items-center mr-2 p-2 "
                  activeOpacity={0.5}
                >
                  <AntDesign name="file1" size={30} color="black" />
                  <Text className="mt-1">Thiết bị</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openFormReceipt}
                  className="items-center mr-2 p-2 "
                  activeOpacity={0.5}
                >
                  <AntDesign name="form" size={30} color="black" />
                  <Text className="mt-1">Nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => console.log("click")}
                  className="items-center mr-2 p-2 "
                  activeOpacity={0.5}
                >
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
