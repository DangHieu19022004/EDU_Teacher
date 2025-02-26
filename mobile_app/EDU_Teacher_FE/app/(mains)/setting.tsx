import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SettingsScreen: React.FC = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const router = useRouter();

  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Cài đặt</Text>
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Image source={require('../../assets/images/Edu.png')} style={{ width: 150, height: 150 }} resizeMode="contain" />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 15, backgroundColor: '#F6F6F6', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome name="bell" size={20} color="#2F54EB" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 16 }}>Thông báo</Text>
        </View>
        <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Chung</Text>
      {[{ icon: 'globe', text: 'Ngôn ngữ' }, { icon: 'info-circle', text: 'Thông tin ứng dụng' }].map((item, i) => (
        <TouchableOpacity key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: '#F6F6F6', marginBottom: 10 }}>
          <FontAwesome name={item.icon as any} size={20} color="#2F54EB" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 16 }}>{item.text}</Text>
        </TouchableOpacity>
      ))}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Khác</Text>
      <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#D32F2F', padding: 15, borderRadius: 15 }}>
        <FontAwesome name="sign-out" size={20} color="white" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16, color: 'white' }}>Đăng xuất</Text>
      </TouchableOpacity>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 }}>
        {[{ icon: 'home', text: 'Trang chủ', route: '/(mains)/home' }, { icon: 'user', text: 'Bản thân', route: '/(mains)/infostudent' }, { icon: 'cog', text: 'Cài đặt', route: '/setting' }].map((item, i) => (
          <TouchableOpacity key={i} style={{ alignItems: 'center' }} onPress={() => router.push(item.route)}>
            <FontAwesome name={item.icon as any} size={24} color={item.route === '/setting' ? '#2F54EB' : 'gray'} />
            <Text style={{ fontSize: 12, color: item.route === '/setting' ? '#2F54EB' : 'gray', marginTop: 3 }}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SettingsScreen;