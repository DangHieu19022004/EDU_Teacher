import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Home: React.FC = () => {
  return (
    <View className="flex-1 bg-white pt-10">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-2">
        <FontAwesome name="bars" size={24} color="black" />
        <Text className="text-lg font-bold">Trang chủ</Text>
        <FontAwesome name="user-circle" size={24} color="black" />
      </View>

      {/* Feature Section */}
      <View className="bg-gray-200 m-3 rounded-lg p-4">
        <Text className="text-base font-bold">Quản lý học bạ</Text>
        <View className="flex-row justify-between mt-3">
          <View className="bg-purple-600 p-5 rounded-lg w-[48%] items-center">
            <FontAwesome name="file-text" size={40} color="white" />
            <Text className="text-white text-sm mt-2">Quét học bạ</Text>
          </View>
          <View className="w-[48%]">
            <View className="bg-pink-500 p-3 rounded-lg mb-2 items-center">
              <FontAwesome name="database" size={30} color="white" />
              <Text className="text-white text-xs mt-2">Kho dữ liệu</Text>
            </View>
            <View className="bg-purple-400 p-3 rounded-lg items-center">
              <FontAwesome name="history" size={30} color="white" />
              <Text className="text-white text-xs mt-2">Lịch sử</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 h-14 flex-row bg-gray-100 border-t border-gray-300 items-center justify-around">
        <TouchableOpacity className="items-center">
          <FontAwesome name="home" size={24} color="blue" />
          <Text className="text-xs text-blue-500">Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome name="user" size={24} color="gray" />
          <Text className="text-xs text-gray-500">Bản thân</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome name="cog" size={24} color="gray" />
          <Text className="text-xs text-gray-500">Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;
