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
import { Picker } from '@react-native-picker/picker'; 

const CLASS_STORAGE_KEY = '@student_classes';

interface Subject {
  name: string;
  hk1: string;
  hk2: string;
  cn: string;
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
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetch(`${API_URL}/classes/`)
      .then((res) => res.json())
      .then((data) => {
        const classList = data.map((cls: any) => ({ ...cls, students: [] }));
        setClasses(classList);
      })
      .catch((err) => console.error('Lỗi khi tải danh sách lớp:', err));
  }, []);

  const fetchStudentsByClass = (classId: string) => {
    fetch(`${API_URL}/class/${classId}/students/`)
      .then((res) => res.json())
      .then((students) => {
        const selected = classes.find((cls) => cls.id === classId);
        if (selected) {
          const updated = { ...selected, students };
          setSelectedClass(updated);
          setClasses((prev) =>
            prev.map((cls) => (cls.id === classId ? updated : cls))
          );
        }
      })
      .catch((err) => console.error('Lỗi khi tải học sinh:', err));
  };

  const handleSearch = (classId: string, query: string) => {
    fetch(`${API_URL}/class/${classId}/students/?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((students) => {
        const selected = classes.find((cls) => cls.id === classId);
        if (selected) {
          const updated = { ...selected, students };
          setSelectedClass(updated);
        }
      })
      .catch((err) => console.error('Lỗi khi tìm kiếm học sinh:', err));
  };

  const handleViewStudent = async (student: StudentItem) => {
    try {
      const res = await fetch(`${API_URL}/student/${student.id}/report/`);
      const fullStudentData = await res.json();

      router.push({
        pathname: '/features/scanning/StudentReportCardScreen',
        params: {
          student: JSON.stringify(fullStudentData),
          className: selectedClass?.name ?? '',
          isEditMode: 'false',
        },
      });
    } catch (err) {
      console.error('Lỗi khi tải học bạ:', err);
    }
  };

  const handleEditStudent = async (student: StudentItem) => {
    try {
      const res = await fetch(`${API_URL}/student/${student.id}/report/`);
      const fullStudentData = await res.json();

      router.push({
        pathname: '/features/scanning/StudentReportCardScreen',
        params: {
          student: JSON.stringify(fullStudentData),
          className: selectedClass?.name ?? '',
          isEditMode: 'true',
        },
      });
    } catch (err) {
      console.error('Lỗi khi tải học bạ:', err);
    }
  };

  const handleDeleteClass = async (id: string) => {
    const updatedClasses = classes.filter((cls) => cls.id !== id);
    setClasses(updatedClasses);
    if (selectedClass?.id === id) {
      setSelectedClass(null);
    }
  };

  const handleDeleteStudent = async (classId: string, studentId: string) => {
    const updatedStudents = selectedClass?.students.filter((s) => s.id !== studentId) || [];
    setSelectedClass((prev) => prev && { ...prev, students: updatedStudents });
  };

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
    }
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
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (selectedClass && text.trim()) {
                handleSearch(selectedClass.id, text);
              } else if (selectedClass) {
                fetchStudentsByClass(selectedClass.id);
              }
            }}
          />
        </View>
        
        {/* Class List */}
        <View style={styles.contentContainer}>
          <View style={styles.classListContainer}>
            <Text style={styles.sectionTitle}>Danh sách lớp</Text>
            <Picker
              selectedValue={selectedClass?.id || ''}
              onValueChange={(classId: string) => {
                const selected = classes.find((cls) => cls.id === classId);
                if (selected) {
                  setSelectedClass(selected);
                  fetchStudentsByClass(classId);
                } else {
                  setSelectedClass(null);
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="Chọn lớp" value="" />
              {classes.map((item) => (
                <Picker.Item key={item.id} label={item.name} value={item.id} />
              ))}
            </Picker>
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
                          onPress={() => handleViewStudent(item)}
                        >
                          <FontAwesome name="eye" size={18} color="#1E88E5" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditStudent(item)}
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
  picker: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
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
