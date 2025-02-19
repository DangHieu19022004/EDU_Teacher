import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
        <FontAwesome name="bars" size={24} color="black" />
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Trang chủ</Text>
        <FontAwesome name="user-circle" size={24} color="black" />
      </View>
      
      {/* Feature Section */}
      <View style={{ backgroundColor: '#F0F0F0', margin: 10, borderRadius: 10, padding: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Quản lý học bạ</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <View style={{ backgroundColor: '#7B61FF', padding: 20, borderRadius: 10, width: '48%' }}>
            <FontAwesome name="file" size={40} color="white" />
            <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>Quét học bạ</Text>
          </View>
          <View style={{ width: '48%' }}>
            <View style={{ backgroundColor: '#D94FBE', padding: 10, borderRadius: 10, marginBottom: 10 }}>
              <FontAwesome name="database" size={30} color="white" />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>Kho dữ liệu</Text>
            </View>
            <View style={{ backgroundColor: '#A47BEF', padding: 10, borderRadius: 10 }}>
              <FontAwesome name="clock-o" size={30} color="white" />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>Lịch sử chỉnh sửa</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Bottom Navigation */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, flexDirection: 'row', backgroundColor: '#F8F8F8', borderTopWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'space-around' }}>
        <TouchableOpacity>
          <FontAwesome name="home" size={24} color="blue" />
          <Text style={{ fontSize: 12, color: 'blue' }}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="user" size={24} color="gray" />
          <Text style={{ fontSize: 12, color: 'gray' }}>Bản thân</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="cog" size={24} color="gray" />
          <Text style={{ fontSize: 12, color: 'gray' }}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
