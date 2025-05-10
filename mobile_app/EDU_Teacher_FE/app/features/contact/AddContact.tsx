import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { BASE_URL } from '@/constants/Config';

interface ParentContact {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  studentName: string;
  studentClass: string;
  relationship: string;
}

interface ClassItem {
  id: string;
  name: string;
  students: StudentItem[];
}

interface StudentItem {
  id: string;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  school: string;
  academicPerformance: string;
  conduct: string;
}

const AddContactScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [contacts, setContacts] = useState<ParentContact[]>([]);

  const [classList, setClassList] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    fetchParentContacts();
  }, []);


  const fetchClassrooms = async () => {
    try {
      const response = await fetch(`${BASE_URL}classroom/get_classrooms/?teacher_id=${user?.uid}`, {
        headers: { Authorization: `Bearer ${user?.uid}` }
      });
      const data = await response.json();
      if (response.ok) {
        const formatted = data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          students: []
        }));
        setClassList(formatted);
      }
    } catch (err) {
      console.error('Lỗi fetch lớp:', err);
    }
  };

  const fetchStudentsInClass = async (classId: string) => {
    try {
      const response = await fetch(`${BASE_URL}classroom/get_students_by_class/?class_id=${classId}`, {
        headers: { Authorization: `Bearer ${user?.uid}` }
      });
      const data = await response.json();
      if (response.ok) {
        const selected = classList.find(cls => cls.id === classId);
        if (selected) {
          setSelectedClass({ ...selected, students: data });
        }
      }
    } catch (err) {
      console.error('Lỗi fetch học sinh:', err);
    }
  };
  const fetchParentContacts = async () => {
    if (!user?.uid) return;
    try {
      const response = await fetch(`${BASE_URL}contact/get_parents/?teacher_id=${user?.uid}`, {
        headers: {
          Authorization: `Bearer ${user?.uid}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setContacts(data); // Giả sử backend trả mảng ParentContact
      } else {
        console.error('Lỗi lấy danh sách phụ huynh:', data);
      }
    } catch (error) {
      console.error('Lỗi fetch get_parents:', error);
    }
  };

  const saveParentInfo = async (newContact: ParentContact) => {
    try {
      const response = await fetch(`${BASE_URL}contact/save_parent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.uid}`
        },
        body: JSON.stringify({
          teacher_id: user?.uid,
          student_id: selectedStudent?.id,
          full_name: newContact.parentName,
          email: newContact.email,
          phone: newContact.phone
        })
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('✅ Thành công', 'Đã lưu liên hệ phụ huynh');
        fetchParentContacts(); // Refresh danh sách
      } else {
        Alert.alert('❌ Lỗi', result?.error || 'Không xác định');
      }
    } catch (err) {
      console.error('Lỗi lưu phụ huynh:', err);
      Alert.alert('❌ Lỗi kết nối tới máy chủ');
    }
  };

  const handleAddContact = () => {
    if (!selectedStudent) {
      Alert.alert('Lỗi', 'Vui lòng chọn học sinh');
      return;
    }

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
      relationship: 'Phụ huynh'
    };

    saveParentInfo(newContact);
    resetForm();

  };

  const resetForm = () => {
    setParentName('');
    setEmail('');
    setPhone('');
    setStudentName('');
    setStudentClass('');
    setSelectedClass(null);
    setSelectedStudent(null);
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa liên hệ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setContacts(contacts.filter(contact => contact.id !== id));
        }
      }
    ]);
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

        <ScrollView horizontal>
          {classList.map(cls => (
            <TouchableOpacity
              key={cls.id}
              onPress={() => fetchStudentsInClass(cls.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: selectedClass?.id === cls.id ? '#0066CC' : '#EEE',
                borderRadius: 8,
                marginRight: 10
              }}
            >
              <Text style={{ color: selectedClass?.id === cls.id ? '#FFF' : '#000' }}>{cls.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedClass && (
          <ScrollView horizontal style={{ marginVertical: 10 }}>
            {selectedClass.students.map(st => (
              <TouchableOpacity
                key={st.id}
                onPress={() => {
                  setSelectedStudent(st);
                  setStudentName(st.name);
                  setStudentClass(selectedClass.name);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: selectedStudent?.id === st.id ? '#1E88E5' : '#EEE',
                  borderRadius: 8,
                  marginRight: 10
                }}
              >
                <Text style={{ color: selectedStudent?.id === st.id ? '#FFF' : '#000' }}>{st.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteContact(item.id)}>
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
