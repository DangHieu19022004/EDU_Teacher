import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Home: React.FC = () => {
  
  const [currentTab, setCurrentTab] = useState('Teacher');

  return (
    <View className="flex-1 bg-white pt-10">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-2">
        <TouchableOpacity onPress={() => {}}>
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Trang chủ</Text>
        <TouchableOpacity onPress={() => {}}>
          <FontAwesome name="user-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Feature Section */}
      <View className="bg-gray-200 m-3 rounded-lg p-4">
        <Text className="text-base font-bold">Quản lý học bạ</Text>
        <View className="flex-row justify-between mt-3">
          <TouchableOpacity className="bg-purple-600 p-5 rounded-lg w-[48%] items-center" onPress={() => {}}>
            <FontAwesome name="file-text" size={40} color="white" />
            <Text className="text-white text-sm mt-2">Quét học bạ</Text>
          </TouchableOpacity>
          <View className="w-[48%]">
            <TouchableOpacity className="bg-pink-500 p-3 rounded-lg mb-2 items-center" onPress={() => {}}>
              <FontAwesome name="database" size={30} color="white" />
              <Text className="text-white text-xs mt-2">Kho dữ liệu</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-purple-400 p-3 rounded-lg items-center" onPress={() => {}}>
              <FontAwesome name="history" size={30} color="white" />
              <Text className="text-white text-xs mt-2">Lịch sử chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 h-14 flex-row bg-gray-100 border-t border-gray-300 items-center justify-around">
          <TouchableOpacity className="items-center" onPress={() => setCurrentTab('Home')}>
            <FontAwesome name="home" size={24} color={currentTab === 'Home' ? 'blue' : 'gray'} />
            <Text className={`text-xs ${currentTab === 'Home' ? 'text-blue-500' : 'text-gray-500'}`}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center" onPress={() => setCurrentTab('Profile')}>
            <FontAwesome name="user" size={24} color={currentTab === 'Profile' ? 'blue' : 'gray'} />
            <Text className={`text-xs ${currentTab === 'Profile' ? 'text-blue-500' : 'text-gray-500'}`}>Bản thân</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center" onPress={() => setCurrentTab('Settings')}>
            <FontAwesome name="cog" size={24} color={currentTab === 'Settings' ? 'blue' : 'gray'} />
            <Text className={`text-xs ${currentTab === 'Settings' ? 'text-blue-500' : 'text-gray-500'}`}>Cài đặt</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
};

export default Home;
