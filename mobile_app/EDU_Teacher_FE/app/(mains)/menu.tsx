import React from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MenuScreen: React.FC = () => {
  return (
    <LinearGradient colors={['#3BA3F2', '#1A47C0']} className="flex-1">
      <SafeAreaView className={`flex-1 px-5 ${Platform.OS === 'android' ? `pt-[${StatusBar.currentHeight || 20}px]` : 'pt-5'}`}>
        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-full px-4 h-10 shadow-lg">
          <TextInput
            placeholder="Tìm kiếm"
            className="flex-1 text-base text-gray-900"
            placeholderTextColor="#888"
          />
          <TouchableOpacity>
            <FontAwesome name="search" size={18} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MenuScreen;
