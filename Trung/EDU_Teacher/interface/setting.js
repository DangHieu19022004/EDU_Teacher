import React from 'react';
import { View, Text, TouchableOpacity, Switch, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 20 }}>
      {/* Header */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Cài đặt</Text>
      
      {/* Logo */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Image 
            source={require('./assets/Edu.png')}  
            style={{ width: 150, height: 150 }} 
            resizeMode="contain" 
        />
        
      </View>
      
      {/* Notification Toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 15, backgroundColor: '#F6F6F6', marginBottom: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome name="bell" size={20} color="#2F54EB" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 16 }}>Thông báo</Text>
        </View>
        <Switch value={true} />
      </View>

      {/* General Settings */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Chung</Text>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: '#F6F6F6', marginBottom: 10 }}>
        <FontAwesome name="globe" size={20} color="#2F54EB" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16 }}>Ngôn ngữ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: '#F6F6F6' }}>
        <FontAwesome name="info-circle" size={20} color="#2F54EB" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16 }}>Thông tin ứng dụng</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 15 }}>Khác</Text>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D32F2F', padding: 15, borderRadius: 15 }}>
        <FontAwesome name="sign-out" size={20} color="white" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16, color: 'white' }}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 }}>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <FontAwesome name="home" size={24} color="gray" />
          <Text style={{ fontSize: 12, color: 'gray' }}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <FontAwesome name="user" size={24} color="gray" />
          <Text style={{ fontSize: 12, color: 'gray' }}>Bản thân</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <FontAwesome name="cog" size={24} color="#2F54EB" />
          <Text style={{ fontSize: 12, color: '#2F54EB' }}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
