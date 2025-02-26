import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Menu: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (searchText.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập từ khóa tìm kiếm.');
    } else {
      Alert.alert('Tìm kiếm', `Bạn đã tìm kiếm: ${searchText}`);
      // Searching activity
    }
  };

  return (
    <LinearGradient colors={['#3BA3F2', '#1A47C0']} className="flex-1">
      <SafeAreaView className={`flex-1 px-5 ${Platform.OS === 'android' ? `pt-[${StatusBar.currentHeight || 20}px]` : 'pt-5'}`}>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-full px-4 h-10 shadow-lg">
          <TextInput
            placeholder="Tìm kiếm"
            className="flex-1 text-base text-gray-900"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText} // Update state while texing
            onSubmitEditing={handleSearch} // Enter and search
          />
          <TouchableOpacity onPress={handleSearch}>
            <FontAwesome name="search" size={18} color="black" />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
};

export default Menu;
