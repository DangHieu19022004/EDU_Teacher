import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Setting: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('Setting');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  return (
    <View className="flex-1 bg-white pt-10 px-5">
      {/* Header */}
      <Text className="text-xl font-bold text-center">Cài đặt</Text>

      {/* Logo */}
      <View className="items-center my-5">
        <Image source={require('../../assets/images/Edu.png')} className="w-36 h-36" resizeMode="contain" />
      </View>

      {/* Notification Toggle */}
      <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-lg mb-3">
        <View className="flex-row items-center">
          <FontAwesome name="bell" size={20} color="#2F54EB" className="mr-3" />
          <Text className="text-base">Thông báo</Text>
        </View>
        <Switch 
          value={isNotificationEnabled} 
          onValueChange={() => setIsNotificationEnabled(!isNotificationEnabled)} 
        />
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

     
      
    </View>
  );
};

export default Setting;
