import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

const Student: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('Student');

  // Image avatar
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Information form
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    gender: 'Nam',
    birthDate: '22/9/2005',
    school: 'Nguyễn Trãi',
    phone: '0123456789',
  });

  // Information form clear or not
  const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({
    name: false,
    gender: false,
    birthDate: false,
    school: false,
    phone: false,
  });

  // Open libary image (working)
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    }
  };

  return (
    <View className="flex-1 bg-white pt-10 px-5">
      {/* Header */}
      <Text className="text-xl font-bold text-center">Thông tin học sinh</Text>

      {/* Profile Picture */}
      <View className="items-center my-5">
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} className="w-24 h-24 rounded-full border-2 border-blue-700" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-300 border-2 border-blue-700 justify-center items-center">
              <FontAwesome name="user" size={50} color="#555" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity className="absolute -bottom-2 right-10 bg-white p-1.5 rounded-full border border-gray-300 shadow-md" onPress={pickImage}>
          <FontAwesome name="pencil" size={16} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Info Fields */}
      {[
        { label: 'Họ tên', key: 'name', icon: 'pencil' },
        { label: 'Giới tính', key: 'gender', icon: 'chevron-down' },
        { label: 'Ngày sinh', key: 'birthDate', icon: 'chevron-down' },
        { label: 'Trường học', key: 'school', icon: 'pencil' },
        { label: 'Số điện thoại', key: 'phone', icon: 'pencil' }
      ].map((item, index) => (
        <View key={index} className="flex-row items-center justify-between bg-gray-100 p-4 rounded-lg mb-3">
          <Text className="text-base font-semibold text-gray-600">{item.label}</Text>
          <View className="flex-row items-center">
            <TextInput
              value={inputFocus[item.key] ? '' : userInfo[item.key as keyof typeof userInfo]}
              className="text-base text-gray-400 mr-2 w-40"
              editable={false} // Không thể sửa trực tiếp
              onFocus={() => setInputFocus((prev) => ({ ...prev, [item.key]: true }))}
            />
            <TouchableOpacity>
              <FontAwesome name={item.icon as keyof typeof FontAwesome.glyphMap} size={18} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

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

export default Student;
