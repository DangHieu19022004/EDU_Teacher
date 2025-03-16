import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { KeyboardTypeOptions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import sampleStudentData from '../test_data/studentData';


const Student: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(sampleStudentData.phone);
  const [name, setName] = useState(sampleStudentData.name);
  const [selectedGender, setSelectedGender] = useState(sampleStudentData.gender);
  const [birthDate, setBirthDate] = useState(new Date(sampleStudentData.dob.split('/').reverse().join('-'))); // Chuyển đổi từ dd/MM/yyyy sang Date
  const [school, setSchool] = useState(sampleStudentData.school);


  const inputFields = [
    { label: 'Họ tên', value: name, setValue: setName },
    { label: 'Trường học hiện tại', value: school, setValue: setSchool },
    { label: 'Số điện thoại', value: phoneNumber, setValue: setPhoneNumber, keyboardType: 'phone-pad', maxLength: 10 }
  ];

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  return (

    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statusBar}>
        </View>

        <Text style={styles.title}>Thông tin học sinh</Text>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={50} color="#555" />
          </View>
        </View>

        <View style={styles.boxContainer}>
        {inputFields.map((item, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={item.value}
                onChangeText={item.setValue}
                style={styles.input}
                keyboardType={item.keyboardType as KeyboardTypeOptions || 'default'}
                maxLength={item.maxLength}
              />
              <FontAwesome name="pencil" size={18} color="#555" />
            </View>
          </View>
        ))}


        <View style={styles.inputContainer}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.inputWrapperGender}>
            <Picker
              selectedValue={selectedGender}
              onValueChange={(itemValue) => setSelectedGender(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Nam" value="Nam" />
              <Picker.Item label="Nữ" value="Nữ" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TouchableOpacity style={styles.inputWrapperDoB} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.input}>{birthDate ? birthDate.toLocaleDateString('vi-VN') : 'Chọn ngày sinh'}</Text>
            <FontAwesome name="caret-down" size={16} color="#555" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>
      </View>
      </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20
  },
  scrollContainer: {
    paddingBottom: 80
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E88E5'
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    padding: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'space-between'
  },
  inputWrapperGender: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 5,
    borderRadius: 10,
    justifyContent: 'space-between'
  },
  inputWrapperDoB: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    padding: 18,
    paddingHorizontal: 20,
    paddingRight: 24,
    borderRadius: 10,
    justifyContent: 'space-between'
  },
  input: {
    fontSize: 16,
    color: '#555',
    flex: 1
  },
  boxContainer: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20
  },

  statusBar: {height: 50, backgroundColor: 'white'},
});

export default Student;
