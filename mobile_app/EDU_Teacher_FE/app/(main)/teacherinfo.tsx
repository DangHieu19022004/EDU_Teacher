import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { KeyboardTypeOptions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import sampleStudentData from '../test_data/studentData.json';
import { useUser } from '../contexts/UserContext';

const TeacherInfo: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(sampleStudentData.phone);
  const [name, setName] = useState(user?.displayName || sampleStudentData.name);
  const [selectedGender, setSelectedGender] = useState(sampleStudentData.gender);
  const [birthDate, setBirthDate] = useState(
    new Date(sampleStudentData.dob.split('/').reverse().join('-'))
  );
  const [school, setSchool] = useState(sampleStudentData.school);
  const [avatarUri, setAvatarUri] = useState(
    user?.photoURL && typeof user?.photoURL === 'string' ? user?.photoURL : null
  );
  const [isChanged, setIsChanged] = useState(false);

  const inputFields = [
    { label: 'Họ tên', value: name, setValue: setName },
    { label: 'Trường học hiện tại', value: school, setValue: setSchool },
    {
      label: 'Số điện thoại',
      value: phoneNumber,
      setValue: setPhoneNumber,
      keyboardType: 'phone-pad',
      maxLength: 10,
    },
  ];

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
      setIsChanged(true);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (typeof uri === 'string') {
          setAvatarUri(uri);
          setIsChanged(true);
        } else {
          console.warn('Invalid URI from ImagePicker:', uri);
          Alert.alert('Lỗi', 'Không thể chọn ảnh do định dạng URI không hợp lệ');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn ảnh');
    }
  };

  const handleSave = () => {
    Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    setIsChanged(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông tin giáo viên</Text>
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage}>
            <View style={styles.avatar}>
              <Image
                source={
                  avatarUri
                    ? { uri: avatarUri }
                    : require('../../assets/images/user.png')
                }
                style={styles.avatarImage}
              />
              <View style={styles.editIcon}>
                <FontAwesome name="pencil" size={14} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {inputFields.map((item, index) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={item.value}
                  onChangeText={(text) => {
                    item.setValue(text);
                    setIsChanged(true);
                  }}
                  style={styles.input}
                  keyboardType={item.keyboardType as KeyboardTypeOptions || 'default'}
                  maxLength={item.maxLength}
                />
                <FontAwesome name="pencil" size={16} color="#0066CC" />
              </View>
            </View>
          ))}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.inputWrapper}>
              <Picker
                selectedValue={selectedGender}
                onValueChange={(itemValue) => {
                  setSelectedGender(itemValue);
                  setIsChanged(true);
                }}
                style={styles.picker}
                dropdownIconColor="#0066CC"
              >
                <Picker.Item label="Nam" value="Nam" />
                <Picker.Item label="Nữ" value="Nữ" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.input}>
                {birthDate ? birthDate.toLocaleDateString('vi-VN') : 'Chọn ngày sinh'}
              </Text>
              <FontAwesome name="caret-down" size={16} color="#0066CC" />
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

        {isChanged && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lưu thông tin</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#0066CC',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0066CC',
    position: 'relative',
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#0066CC',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 50,
  },
  input: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  picker: {
    flex: 1,
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TeacherInfo;
