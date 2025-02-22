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

const ProfileScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 20 }}>
      {/* Header */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Thông tin giáo viên</Text>
      
      {/* Profile Picture */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }}>
          <FontAwesome name="user" size={50} color="#555" />
        </View>
        <TouchableOpacity style={{ position: 'absolute', bottom: 0, right: 130, backgroundColor: '#FFF', padding: 5, borderRadius: 15, elevation: 5 }}>
          <FontAwesome name="pencil" size={16} color="#555" />
        </TouchableOpacity>
      </View>
      
      {/* Info Fields */}
      {infoFields.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F6F6F6', padding: 15, borderRadius: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 16, color: '#333' }}>{item.label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput value={item.value} style={{ fontSize: 16, color: '#888', marginRight: 10 }} editable={false} />
            <TouchableOpacity>
              <FontAwesome name={item.icon} size={18} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {/* Bottom Navigation */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 }}>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <FontAwesome name="home" size={24} color="gray" />
          <Text style={{ fontSize: 12, color: 'gray' }}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <FontAwesome name="user" size={24} color="#2F54EB" />
          <Text style={{ fontSize: 12, color: '#2F54EB' }}>Bản thân</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <FontAwesome name="cog" size={24} color="gray" />
          <Text style={{ fontSize: 12, color: 'gray' }}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;
