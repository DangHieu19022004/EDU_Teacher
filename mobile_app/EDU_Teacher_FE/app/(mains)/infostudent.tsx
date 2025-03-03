import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const Student: React.FC = () => {
  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState('Nam');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [school, setSchool] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigation = useNavigation();
  
  const inputFields = [
    { label: 'Họ tên', value: name, setValue: setName },
    { label: 'Trường học hiện tại', value: school, setValue: setSchool },
    { label: 'Số điện thoại', value: phoneNumber, setValue: setPhoneNumber, keyboardType: 'numeric', maxLength: 10 }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 20 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>Thông tin học sinh</Text>
        
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2F54EB' }}>
            <FontAwesome name="user" size={50} color="#555" />
          </View>
        </View>

        {inputFields.map((item, index) => (
          <View key={index} style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, color: '#333', marginBottom: 5 }}>{item.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F6F6', padding: 15, borderRadius: 10, justifyContent: 'space-between' }}>
              <TextInput 
                value={item.value} 
                onChangeText={item.setValue} 
                style={{ fontSize: 16, color: '#555', flex: 1 }} 
                keyboardType={item.keyboardType || 'default'} 
                maxLength={item.maxLength}
              />
              <FontAwesome name="pencil" size={18} color="#555" />
            </View>
          </View>
        ))}

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 16, color: '#333', marginBottom: 5 }}>Giới tính</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F6F6', padding: 15, borderRadius: 10, justifyContent: 'space-between' }} onPress={() => setShowGenderModal(true)}>
            <Text style={{ fontSize: 16, color: '#555' }}>{selectedGender || 'Chọn giới tính'}</Text>
            <FontAwesome name="chevron-down" size={18} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 16, color: '#333', marginBottom: 5 }}>Ngày sinh</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F6F6', padding: 15, borderRadius: 10, justifyContent: 'space-between' }} onPress={() => setShowDatePicker(true)}>
            <Text style={{ fontSize: 16, color: '#555' }}>{birthDate ? birthDate.toLocaleDateString() : 'Chọn ngày sinh'}</Text>
            <FontAwesome name="chevron-down" size={18} color="#555" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 }}>
        {[{ icon: 'home', text: 'Trang chủ', screen: 'home' }, { icon: 'user', text: 'Bản thân', screen: 'Student' }, { icon: 'cog', text: 'Cài đặt', screen: 'settings' }].map((item, i) => (
          <TouchableOpacity key={i} style={{ alignItems: 'center' }} onPress={() => navigation.navigate(item.screen as never)}>
            <FontAwesome name={item.icon as any} size={24} color={item.screen === 'Student' ? '#2F54EB' : 'gray'} />
            <Text style={{ fontSize: 12, color: item.screen === 'Student' ? '#2F54EB' : 'gray', marginTop: 3 }}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Student;
