import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLASS_STORAGE_KEY = '@student_classes';

interface Subject {
  name: string;
  hk1: string;
  hk2: string;
  cn: string;
}

interface ClassData {
  class: string;
  subjects: Subject[];
}

interface StudentItem {
  id: string;
  name: string;
  transcript?: string;
  gender: string;
  dob: string;
  phone: string;
  school: string;
  academicPerformance: string;
  conduct: string;
  classList?: ClassData[];
  subjects?: Subject[];
  images?: string[];
}

interface ClassItem {
  id: string;
  name: string;
  students: StudentItem[];
}

const ClassListScreen: React.FC = () => {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSearchClass, setSelectedSearchClass] = useState<ClassItem | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const savedClasses = await AsyncStorage.getItem(CLASS_STORAGE_KEY);
        if (savedClasses) {
          setClasses(JSON.parse(savedClasses));
        } else {
          setClasses([
            {
              id: '1',
              name: 'Lớp 10A1',
              students: [
                {
                  id: '1',
                  name: 'Hoàng Văn A',
                  transcript: '',
                  gender: 'Nam',
                  dob: '01/01/2005',
                  phone: '0986802623',
                  school: 'THPT A',
                  academicPerformance: 'Giỏi',
                  conduct: 'Tốt',
                  subjects: [],
                },
                {
                  id: '2',
                  name: 'Nguyễn Văn B',
                  transcript: '',
                  gender: 'Nam',
                  dob: '02/02/2005',
                  phone: '0986802624',
                  school: 'THPT A',
                  academicPerformance: 'Khá',
                  conduct: 'Tốt',
                  subjects: [],
                },
              ],
            },
            { id: '2', name: 'Lớp 10A2', students: [] },
            { id: '3', name: 'Lớp 11D1', students: [] },
          ]);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };
    loadClasses();
  }, []);

  const handleAddClass = async () => {
    if (newClassName.trim()) {
      const newClass: ClassItem = {
        id: Date.now().toString(),
        name: newClassName,
        students: [],
      };
      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      setNewClassName('');
      setShowAddModal(false);
      await AsyncStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(updatedClasses));
    }
  };

  const handleDeleteClass = async (id: string) => {
    const updatedClasses = classes.filter((cls) => cls.id !== id);
    setClasses(updatedClasses);
    if (selectedClass?.id === id) {
      setSelectedClass(null);
    }
    await AsyncStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(updatedClasses));
  };

  const handleDeleteStudent = async (classId: string, studentId: string) => {
    const updatedClasses = classes.map((cls) => {
      if (cls.id === classId) {
        return { ...cls, students: cls.students.filter((s) => s.id !== studentId) };
      }
      return cls;
    });
    setClasses(updatedClasses);
    if (selectedClass?.id === classId) {
      setSelectedClass({
        ...selectedClass,
        students: selectedClass.students.filter((s) => s.id !== studentId),
      });
    }
    await AsyncStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(updatedClasses));
  };

  const handleViewStudent = async (student: StudentItem, className: string) => {
    // Lấy dữ liệu đầy đủ từ AsyncStorage nếu cần
    const savedClasses = await AsyncStorage.getItem(CLASS_STORAGE_KEY);
    let fullStudentData = student;

    if (savedClasses) {
      const parsedClasses: ClassItem[] = JSON.parse(savedClasses);
      const targetClass = parsedClasses.find((cls) => cls.name === className);
      if (targetClass) {
        const foundStudent = targetClass.students.find((s) => s.id === student.id);
        if (foundStudent) {
          fullStudentData = foundStudent; // Cập nhật dữ liệu đầy đủ của học sinh
        }
      }
    }

    console.log('Viewing student:', fullStudentData);

    router.push({
      pathname: '/features/scanning/StudentReportCardScreen', // Sửa lại thành StudentReportCardScreen
      params: {
        student: JSON.stringify(fullStudentData),
        className,
        isEditMode: 'false',
      },
    });
  };

  const handleEditStudent = async (student: StudentItem, className: string) => {
    // Tương tự, lấy dữ liệu đầy đủ từ AsyncStorage nếu cần
    const savedClasses = await AsyncStorage.getItem(CLASS_STORAGE_KEY);
    let fullStudentData = student;

    if (savedClasses) {
      const parsedClasses: ClassItem[] = JSON.parse(savedClasses);
      const targetClass = parsedClasses.find((cls) => cls.name === className);
      if (targetClass) {
        const foundStudent = targetClass.students.find((s) => s.id === student.id);
        if (foundStudent) {
          fullStudentData = foundStudent; // Cập nhật dữ liệu đầy đủ của học sinh
        }
      }
    }

    router.push({
      pathname: '/features/scanning/StudentReportCardScreen', // Sửa lại thành StudentReportCardScreen
      params: {
        student: JSON.stringify(fullStudentData),
        className,
        isEditMode: 'true',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kho dữ liệu học bạ</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <FontAwesome name="plus" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm lớp hoặc học sinh"
            placeholderTextColor="#888"
          />
        </View>

        <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Tìm kiếm học bạ</Text>

        {/* Combobox chọn lớp */}
        <View style={{ backgroundColor: 'white', borderRadius: 5, marginBottom: 10, paddingHorizontal: 10 }}>
          <Text style={{ marginVertical: 5 }}>Chọn lớp:</Text>
          <FlatList
            data={classes}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedSearchClass(item);
                  setSelectedStudent(null); // reset chọn học sinh
                }}
                style={{
                  padding: 10,
                  marginRight: 10,
                  borderRadius: 5,
                  backgroundColor: selectedSearchClass?.id === item.id ? '#1E88E5' : '#EEE',
                }}
              >
                <Text style={{ color: selectedSearchClass?.id === item.id ? 'white' : '#333' }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Combobox chọn học sinh */}
        {selectedSearchClass && (
          <View style={{ backgroundColor: 'white', borderRadius: 5, marginBottom: 10, paddingHorizontal: 10 }}>
            <Text style={{ marginVertical: 5 }}>Chọn học sinh:</Text>
            <FlatList
              data={selectedSearchClass.students}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStudent(item);
                    handleViewStudent(item, selectedSearchClass.name);
                  }}
                  style={{
                    padding: 10,
                    marginRight: 10,
                    borderRadius: 5,
                    backgroundColor: '#EEE',
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>


        {/* Class List */}
        <View style={styles.contentContainer}>
          <View style={styles.classListContainer}>
            <Text style={styles.sectionTitle}>Danh sách lớp</Text>
            <FlatList
              data={classes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.classItem,
                    selectedClass?.id === item.id && styles.selectedClassItem,
                  ]}
                  onPress={() => setSelectedClass(item)}
                >
                  <Text style={styles.className}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteClass(item.id)}>
                    <FontAwesome name="trash" size={18} color="#D92D20" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Student List */}
          <View style={styles.studentListContainer}>
            {selectedClass ? (
              <>
                <Text style={styles.sectionTitle}>{selectedClass.name}</Text>
                <FlatList
                  data={selectedClass.students}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.studentItem}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.transcriptText}>
                        {item.transcript || 'Chưa có học bạ'}
                      </Text>
                      <View style={styles.studentActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleViewStudent(item, selectedClass.name)}
                        >
                          <FontAwesome name="eye" size={18} color="#1E88E5" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditStudent(item, selectedClass.name)}
                        >
                          <FontAwesome name="edit" size={18} color="#FFA500" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteStudent(selectedClass.id, item.id)}
                        >
                          <FontAwesome name="trash" size={18} color="#D92D20" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </>
            ) : (
              <Text style={styles.emptyText}>Chọn một lớp để xem học sinh</Text>
            )}
          </View>
        </View>

        {/* Add Class Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Thêm lớp mới</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Tên lớp"
                value={newClassName}
                onChangeText={setNewClassName}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddClass}
                >
                  <Text style={styles.buttonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 30,
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
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 40, color: '#333' },
  contentContainer: { flex: 1, flexDirection: 'row' },
  classListContainer: { flex: 1, padding: 10 },
  studentListContainer: { flex: 2, padding: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  selectedClassItem: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1E88E5',
  },
  className: { fontSize: 16, color: '#333' },
  studentItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  transcriptText: { fontSize: 14, color: '#666', marginTop: 5 },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: '#E0E0E0' },
  addButton: { backgroundColor: '#1E88E5' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default ClassListScreen;
