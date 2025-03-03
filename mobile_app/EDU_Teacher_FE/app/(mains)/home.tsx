import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
        <TouchableOpacity onPress={() => router.push('/menu')}>
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Trang chủ</Text>
        <TouchableOpacity>
          <FontAwesome name="user-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      {/* Feature Section */}
      <View style={{ backgroundColor: '#F0F0F0', margin: 10, borderRadius: 10, padding: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Quản lý học bạ</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <TouchableOpacity style={{ backgroundColor: '#7B61FF', padding: 20, borderRadius: 10, width: '48%', alignItems: 'center' }}>
            <FontAwesome name="file" size={40} color="white" />
            <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>Quét học bạ</Text>
          </TouchableOpacity>
          <View style={{ width: '48%' }}>
            <TouchableOpacity style={{ backgroundColor: '#D94FBE', padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}>
              <FontAwesome name="database" size={30} color="white" />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>Kho dữ liệu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#A47BEF', padding: 10, borderRadius: 10, alignItems: 'center' }}>
              <FontAwesome name="clock-o" size={30} color="white" />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>Lịch sử chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Bottom Navigation */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 }}>
        {[{ icon: 'home', text: 'Trang chủ', route: '/(mains)/home' }, { icon: 'user', text: 'Bản thân', route: '/(mains)/infostudent' }, { icon: 'cog', text: 'Cài đặt', route: '/setting' }].map((item, index) => (
          <TouchableOpacity key={index} style={{ alignItems: 'center' }} onPress={() => router.push(item.route)}>
            <FontAwesome name={item.icon as any} size={24} color={item.route === '/(mains)/home' ? 'blue' : 'gray'} />
            <Text style={{ fontSize: 12, color: item.route === '/(mains)/home' ? 'blue' : 'gray', marginTop: 3 }}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
