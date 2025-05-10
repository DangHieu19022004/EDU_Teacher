import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ParentContact {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  studentName: string;
  studentClass: string;
  relationship: string; // Mặc định là "Phụ huynh"
}

const AddContactScreen: React.FC = () => {
  const router = useRouter();
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [contacts, setContacts] = useState<ParentContact[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  // Load danh sách lớp từ API hoặc local storage
  useEffect(() => {
    // Giả lập dữ liệu lớp học
    const fetchClasses = async () => {
      // Trong thực tế, bạn sẽ gọi API hoặc lấy từ context
      const mockClasses = ['10A1', '10A2', '11A1', '11A2', '12A1'];
      setClasses(mockClasses);
    };

    fetchClasses();
  }, []);

  // Load danh sách liên hệ đã lưu
  useEffect(() => {
    // Giả lập dữ liệu mẫu
    const mockContacts: ParentContact[] = [
      {
        id: '1',
        parentName: 'Nguyễn Văn A',
        email: 'a.nguyen@example.com',
        phone: '0912345678',
        studentName: 'Nguyễn Thị B',
        studentClass: '10A1',
        relationship: 'Phụ huynh'
      },
      {
        id: '2',
        parentName: 'Trần Văn C',
        email: 'c.tran@example.com',
        phone: '0987654321',
        studentName: 'Trần Thị D',
        studentClass: '11A2',
        relationship: 'Phụ huynh'
      },
    ];
    setContacts(mockContacts);
  }, []);

  const handleAddContact = () => {
    if (!parentName || !email || !phone || !studentName || !studentClass) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (!/^\d{10,11}$/.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }

    const newContact: ParentContact = {
      id: Date.now().toString(),
      parentName,
      email,
      phone,
      studentName,
      studentClass,
      relationship: 'Phụ huynh' // Mặc định
    };

    setContacts([...contacts, newContact]);
    resetForm();
    Alert.alert('Thành công', 'Đã thêm liên hệ phụ huynh mới');
  };

  const resetForm = () => {
    setParentName('');
    setEmail('');
    setPhone('');
    setStudentName('');
    setStudentClass('');
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa liên hệ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setContacts(contacts.filter(contact => contact.id !== id));
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm liên hệ phụ huynh</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Thông tin phụ huynh</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ tên phụ huynh"
          value={parentName}
          onChangeText={setParentName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionTitle}>Thông tin học sinh</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ tên học sinh"
          value={studentName}
          onChangeText={setStudentName}
        />

        <View style={styles.classPickerContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Lớp"
            value={studentClass}
            onChangeText={setStudentClass}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>Thêm liên hệ</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.parentName}</Text>
              <Text style={styles.contactDetail}>PHHS của: {item.studentName} - {item.studentClass}</Text>
              <Text style={styles.contactDetail}>Email: {item.email}</Text>
              <Text style={styles.contactDetail}>Điện thoại: {item.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteContact(item.id)}
            >
              <FontAwesome name="trash" size={20} color="#D92D20" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.listTitle}>Danh sách liên hệ phụ huynh</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  classPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classPickerButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  addButton: {
    backgroundColor: '#1E88E5',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  contactItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  deleteButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
});

export default AddContactScreen;
