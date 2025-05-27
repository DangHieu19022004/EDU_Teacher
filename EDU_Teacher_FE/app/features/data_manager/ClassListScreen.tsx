import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  StatusBar,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from "../../contexts/UserContext";
import { BASE_URL } from '@/constants/Config';

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
  name: string
  gender: string;
  dob: string;
  phone: string;
  school: string;
  academicPerformance: string;
  conduct: string;
  classList?: ClassData[];
  subjects?: Subject[];
  images?: string[];
  reportCardId?: string;
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
  const { user } = useUser();
  const [schoolName, setSchoolName] = useState('');
  const [classYear, setClassYear] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.uid) return;

      try {
        const response = await fetch(`${BASE_URL}classroom/get_classrooms/?teacher_id=${user.uid}`, {
          headers: {
            Authorization: `Bearer ${user.uid}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          const formatted = data.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            students: [], // nếu chưa trả danh sách học sinh thì để rỗng
          }));
          setClasses(formatted);
          await AsyncStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(formatted));
        } else {
          console.error('API error:', data);
        }
      } catch (error) {
        console.error('Lỗi khi tải lớp từ server:', error);
      }
    };

    loadClasses();
  }, []);

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;

    try {
      const response = await fetch(`${BASE_URL}classroom/save_classroom/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.uid}`,
        },
        body: JSON.stringify({
          name: newClassName,
          school_name: schoolName,
          class_year: classYear,
        }),
      });

      const data = await response.json();
      console.log('uid:', user?.uid);
      if (response.ok) {
        const newClass: ClassItem = {
          id: data.class_id,   // backend trả về class_id = UUID
          name: newClassName,
          students: [],
        };
        const updatedClasses = [...classes, newClass];
        setClasses(updatedClasses);
        await AsyncStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(updatedClasses));
        setShowAddModal(false);
        setNewClassName('');
        setSchoolName('');
        setClassYear('');
      } else {
        console.error('API error:', data);
        alert('Không thể thêm lớp. Lỗi: ' + (data?.error || 'Không xác định'));
      }
    } catch (error) {
      console.error('Request error:', error);
      alert('Có lỗi khi kết nối tới máy chủ.');
    }
  };


  const handleDeleteClass = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}classroom/delete_classroom/?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.uid}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Lỗi xoá lớp:', result);
        alert('Không thể xoá lớp. Vui lòng thử lại.');
        return;
      }

      // Cập nhật danh sách lớp local
      const updatedClasses = classes.filter((cls) => cls.id !== id);
      setClasses(updatedClasses);
      if (selectedClass?.id === id) {
        setSelectedClass(null);
      }
      await AsyncStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(updatedClasses));
      console.log('✅ Xoá lớp thành công:', result.message);
    } catch (error) {
      console.error('❌ Lỗi gọi API xoá lớp:', error);
      alert('Đã xảy ra lỗi khi xoá lớp.');
    }
  };


  const handleDeleteStudent = async (classId: string, studentId: string) => {
    try {
      const response = await fetch(`${BASE_URL}ocr/get_full_report_card/?student_id=${studentId}`, {
        headers: {
          Authorization: `Bearer ${user?.uid}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('❌ Không thể lấy report card:', data);
        alert('Không thể lấy học bạ để xoá.');
        return;
      }

      const reportCardId = data.report_card?.id;
      if (!reportCardId) {
        alert('Không tìm thấy reportCardId để xoá.');
        return;
      }

      const deleteResponse = await fetch(`${BASE_URL}ocr/delete_full_report_card/?id=${reportCardId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.uid}`,
        },
      });

      const result = await deleteResponse.json();
      if (!deleteResponse.ok) {
        console.error('❌ Lỗi xoá học bạ:', result);
        alert('Không thể xoá học bạ.');
        return;
      }

      console.log('✅ Đã xoá học bạ:', result.message);

      // Cập nhật danh sách lớp trong frontend
      const updatedClasses = classes.map((cls) => {
        if (cls.id === classId) {
          return {
            ...cls,
            students: cls.students.filter((s) => s.id !== studentId),
          };
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
    } catch (error) {
      console.error('❌ Lỗi gọi API xoá học bạ:', error);
      alert('Đã xảy ra lỗi khi xoá học bạ.');
    }
  };


  const handleViewStudent = async (student: StudentItem, fallbackClassName: string) => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`${BASE_URL}ocr/get_full_report_card/?student_id=${student.id}`, {
        headers: {
          Authorization: `Bearer ${user.uid}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Lỗi lấy dữ liệu học bạ:', data);
        alert('Không thể tải dữ liệu học bạ. Vui lòng thử lại.');
        return;
      }

      // Map lại dữ liệu cho đúng interface StudentItem
      const fullStudentData: StudentItem = {
        id: data.student.id,
        name: data.student.name || '',
        dob: data.student.dob || '',
        gender: data.student.gender || '',
        phone: data.student.phone || '',
        school: data.student.school || data.school_name || '', // ưu tiên student.school, fallback school_name
        academicPerformance: data.student.academicPerformance || '',
        conduct: data.student.conduct || '',
        classList: data.classList || [],
      };

      const className = data.class_name || fallbackClassName;

      router.push({
        pathname: '/features/scanning/StudentReportCardScreen',
        params: {
          student: JSON.stringify(fullStudentData),
          className,
          isEditMode: 'false',
          reportCardId: data.report_card?.id || '',

        },
      });

    } catch (error) {
      console.error('Lỗi gọi API xem học bạ:', error);
      alert('Có lỗi xảy ra khi tải học bạ.');
    }
  };



  const handleEditStudent = async (student: StudentItem, fallbackClassName: string) => {
    // Hiển thị xác nhận trước
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn sửa học bạ của học sinh "${student.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Sửa',
          style: 'default',
          onPress: async () => {
            if (!user?.uid) return;

            try {
              const response = await fetch(`${BASE_URL}ocr/get_full_report_card/?student_id=${student.id}`, {
                headers: {
                  Authorization: `Bearer ${user.uid}`,
                },
              });

              const data = await response.json();
              if (!response.ok) {
                console.error('Lỗi lấy dữ liệu học bạ:', data);
                alert('Không thể tải dữ liệu học bạ. Vui lòng thử lại.');
                return;
              }

              const fullStudentData: StudentItem = {
                id: data.student.id,
                name: data.student.name || '',
                dob: data.student.dob || '',
                gender: data.student.gender || '',
                phone: data.student.phone || '',
                school: data.student.school || data.school_name || '',
                academicPerformance: data.student.academicPerformance || '',
                conduct: data.student.conduct || '',
                classList: data.classList || [],
                reportCardId: data.report_card?.id || '',
              };

              const className = data.class_name || fallbackClassName;

              router.push({
                pathname: '/features/scanning/StudentReportCardScreen',
                params: {
                  student: JSON.stringify(fullStudentData),
                  className,
                  isEditMode: 'true',
                  reportCardId: data.report_card?.id || '',
                }
              });

            } catch (error) {
              console.error('Lỗi gọi API chỉnh sửa học bạ:', error);
              alert('Có lỗi xảy ra khi tải học bạ.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kho dữ liệu học bạ</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <FontAwesome name="plus" size={24} color="white" />
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
                  onPress={async () => {
                    try {
                      const response = await fetch(`${BASE_URL}classroom/get_students_by_class/?class_id=${item.id}`, {
                        headers: { Authorization: `Bearer ${user?.uid}` },
                      });
                      const students = await response.json();
                      if (response.ok) {
                        setSelectedClass({ ...item, students }); // Gán danh sách học sinh vào lớp được chọn
                      } else {
                        console.error('Lỗi lấy học sinh:', students);
                      }
                    } catch (error) {
                      console.error('Lỗi fetch học sinh:', error);
                    }
                  }}

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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.sectionTitle}>{selectedClass.name}</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#1E88E5',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                    onPress={() => router.push('/features/scanning/photoCapture')}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', }}>+ Thêm học bạ</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={selectedClass.students}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.studentItem}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.transcriptText}>
                        Ngày sinh: {item.dob || 'Không có'}
                      </Text>
                      <Text style={styles.transcriptText}>
                        Trường: {item.school || 'Không có'}
                      </Text>
                      <View style={styles.studentActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleViewStudent(item, selectedClass.name)}
                        >
                          <FontAwesome name="eye" size={20} color="#1E88E5" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditStudent(item, selectedClass.name)}
                        >
                          <FontAwesome name="edit" size={20} color="#FFA500" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteStudent(selectedClass.id, item.id)}
                        >
                          <FontAwesome name="trash" size={20} color="#D92D20" />
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
              <TextInput
                style={styles.modalInput}
                placeholder="Tên trường"
                value={schoolName}
                onChangeText={setSchoolName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Niên khóa (VD: 2022-2025)"
                value={classYear}
                onChangeText={setClassYear}
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
  },
  header: {
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#0066CC',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white'},
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
    marginTop: 10,
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
    marginHorizontal: 20,
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
