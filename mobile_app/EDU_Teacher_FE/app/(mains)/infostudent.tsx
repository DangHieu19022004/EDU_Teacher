import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Student: React.FC = () => {
  return (
    <View className="flex-1 bg-white pt-10 px-5">
      {/* Header */}
      <Text className="text-xl font-bold text-center">Thông tin học sinh</Text>

      {/* Profile Picture */}
      <View className="items-center my-5">
        <View className="w-24 h-24 rounded-full bg-gray-300 border-2 border-blue-700 justify-center items-center">
          <FontAwesome name="user" size={50} color="#555" />
        </View>
        <TouchableOpacity className="absolute -bottom-2 right-10 bg-white p-1.5 rounded-full border border-gray-300 shadow-md">
          <FontAwesome name="pencil" size={16} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Info Fields */}
      {[
        { label: 'Họ tên', value: 'Nguyễn Văn A', icon: 'pencil' },
        { label: 'Giới tính', value: 'Nam', icon: 'chevron-down' },
        { label: 'Ngày sinh', value: '22/9/2005', icon: 'chevron-down' },
        { label: 'Trường học', value: 'Nguyễn Trãi', icon: 'pencil' },
        { label: 'Số điện thoại', value: '0123456789', icon: 'pencil' }
      ].map((item, index) => (
        <View key={index} className="flex-row items-center justify-between bg-gray-100 p-4 rounded-lg mb-3">
          <Text className="text-base text-gray-800">{item.label}</Text>
          <View className="flex-row items-center">
            <TextInput value={item.value} className="text-base text-gray-500 mr-2" editable={false} />
            <TouchableOpacity>
              <FontAwesome name={item.icon as keyof typeof FontAwesome.glyphMap} size={18} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 h-16 flex-row bg-white border-t border-gray-300 items-center justify-around">
        <TouchableOpacity className="items-center">
          <FontAwesome name="home" size={24} color="gray" />
          <Text className="text-xs text-gray-500">Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome name="user" size={24} color="#2F54EB" />
          <Text className="text-xs text-blue-700">Bản thân</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome name="cog" size={24} color="gray" />
          <Text className="text-xs text-gray-500">Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Student;
