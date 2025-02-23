import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface InfoField {
  label: string;
  value: string;
  icon: keyof typeof FontAwesome.glyphMap;
}

const infoFields: InfoField[] = [
  { label: 'Họ tên', value: 'Nguyễn Văn A', icon: 'pencil' },
  { label: 'Giới tính', value: 'Nam', icon: 'pencil' },
  { label: 'Cơ sở công tác', value: 'THPT X, Quận Y...', icon: 'pencil' },
  { label: 'Email', value: 'NVA123@gmail.com', icon: 'pencil' },
  { label: 'Số điện thoại', value: '0123456789', icon: 'pencil' }
];

const Teacher: React.FC = () => {
  return (
    <View className="flex-1 bg-white pt-10 px-5">
      {/* Header */}
      <Text className="text-xl font-bold text-center">Thông tin giáo viên</Text>

      {/* Profile Picture */}
      <View className="items-center my-5">
        <View className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-2 border-blue-700">
          <FontAwesome name="user" size={50} color="#555" />
        </View>
        <TouchableOpacity className="absolute -bottom-2 right-10 bg-white p-1.5 rounded-full border border-gray-300 shadow-md">
          <FontAwesome name="pencil" size={16} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Info Fields */}
      {infoFields.map((item, index) => (
        <View key={index} className="flex-row items-center justify-between bg-gray-100 p-4 rounded-lg mb-3">
          <Text className="text-base text-gray-800">{item.label}</Text>
          <View className="flex-row items-center">
            <TextInput value={item.value} className="text-base text-gray-500 mr-2" editable={false} />
            <TouchableOpacity>
              <FontAwesome name={item.icon} size={18} color="#555" />
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

export default Teacher;
