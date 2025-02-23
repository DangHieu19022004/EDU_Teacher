import React from 'react';
import { View, Text, TouchableOpacity, Switch, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SettingScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-white pt-10 px-5">
      {/* Header */}
      <Text className="text-xl font-bold text-center">Cài đặt</Text>

      {/* Logo */}
      <View className="items-center my-5">
        <Image source={require('./assets/Edu.png')} className="w-36 h-36" resizeMode="contain" />
      </View>

      {/* Notification Toggle */}
      <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-lg mb-3">
        <View className="flex-row items-center">
          <FontAwesome name="bell" size={20} color="#2F54EB" className="mr-3" />
          <Text className="text-base">Thông báo</Text>
        </View>
        <Switch value={true} />
      </View>

      {/* General Settings */}
      <Text className="text-base font-semibold mt-3 mb-2">Chung</Text>
      <TouchableOpacity className="flex-row items-center bg-gray-100 p-4 rounded-lg mb-3">
        <FontAwesome name="globe" size={20} color="#2F54EB" className="mr-3" />
        <Text className="text-base">Ngôn ngữ</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center bg-gray-100 p-4 rounded-lg mb-3">
        <FontAwesome name="info-circle" size={20} color="#2F54EB" className="mr-3" />
        <Text className="text-base">Thông tin ứng dụng</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <Text className="text-base font-semibold mt-3 mb-2">Khác</Text>
      <TouchableOpacity className="flex-row items-center justify-center bg-red-600 p-4 rounded-lg">
        <FontAwesome name="sign-out" size={20} color="white" className="mr-3" />
        <Text className="text-base text-white">Đăng xuất</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 h-16 flex-row bg-white border-t border-gray-300 items-center justify-around py-2">
        <TouchableOpacity className="items-center">
          <FontAwesome name="home" size={24} color="gray" />
          <Text className="text-xs text-gray-500">Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome name="user" size={24} color="gray" />
          <Text className="text-xs text-gray-500">Bản thân</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome name="cog" size={24} color="#2F54EB" />
          <Text className="text-xs text-[#2F54EB]">Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingScreen;
