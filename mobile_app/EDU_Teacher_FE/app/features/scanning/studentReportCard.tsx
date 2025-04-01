import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';

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
  gender: string;
  dob: string;
  phone: string;
  school: string;
  academicPerformance: string;
  conduct: string;
  classList?: ClassData[];
  subjects?: Subject[];
  images?: string[];
  transcript?: string;
}

interface ClassItem {
  id: string;
  name: string;
  students: StudentItem[];
}

type RootStackParamList = {
  StudentReportCard: {
    student: string;
    className: string;
    isEditMode: string;
  };
  ClassListScreen: undefined;
};

type StudentReportCardNavigationProp = NavigationProp<RootStackParamList, 'StudentReportCard'>;

interface StudentReportCardProps {
  studentData: StudentItem;
  className: string;
  onSave?: (updatedStudent: StudentItem) => void;
  isEditMode?: boolean;
  navigation: StudentReportCardNavigationProp;
}

const StudentReportCard = ({
  studentData,
  className,
  onSave,
  isEditMode = false,
  navigation,
}: StudentReportCardProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [editableStudent, setEditableStudent] = useState<StudentItem>(studentData);

  useEffect(() => {
    console.log('Received studentData in StudentReportCard:', studentData);
    setEditableStudent(studentData);
  }, [studentData]);

  console.log('Editable student in StudentReportCard:', editableStudent);
  console.log('Class name in StudentReportCard:', className);

  if (!editableStudent || !editableStudent.name) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lỗi: Dữ liệu học sinh không hợp lệ.</Text>
      </View>
    );
  }

  const selectedClassData = editableStudent.classList?.find((cls) => cls.class.trim() === className.trim());
  const selectedSubjects = selectedClassData?.subjects || editableStudent.subjects || [];
  const images = editableStudent.images || [];

  // Hàm tìm lớp lớn nhất từ classList
  const getHighestClass = (classList: ClassData[] | undefined): string => {
    if (!classList || classList.length === 0) return 'Unknown';

    // Giả sử tên lớp có định dạng như "10D5", "11D5", "12A1", trích xuất số lớp
    const classNumbers = classList.map((cls) => {
      const match = cls.class.match(/\d+/); // Lấy số từ tên lớp (10, 11, 12, ...)
      return match ? parseInt(match[0], 10) : 0;
    });

    const maxClassNum = Math.max(...classNumbers);
    const highestClass = classList.find((cls) => cls.class.includes(maxClassNum.toString()));
    return highestClass ? highestClass.class : classList[0].class; // Trả về lớp đầu tiên nếu không tìm thấy
  };

  const saveStudentReport = async () => {
    setIsSaving(true);
    try {
      const savedClasses = await AsyncStorage.getItem(CLASS_STORAGE_KEY);
      let allClasses: ClassItem[] = savedClasses ? JSON.parse(savedClasses) : [];

      // Xác định lớp lớn nhất từ classList
      const highestClassName = getHighestClass(editableStudent.classList);
      console.log('Highest class determined:', highestClassName);

      // Kiểm tra xem lớp lớn nhất đã tồn tại chưa
      let targetClass = allClasses.find((c) => c.name === highestClassName);
      if (!targetClass) {
        // Tạo lớp mới nếu chưa tồn tại
        targetClass = { id: Date.now().toString(), name: highestClassName, students: [] };
        allClasses.push(targetClass);
        console.log('Created new class:', highestClassName);
      }

      const studentToSave = {
        ...editableStudent,
        transcript: 'Có học bạ',
      };

      // Cập nhật hoặc thêm học sinh vào lớp
      const studentIndex = targetClass.students.findIndex((s) => s.id === studentToSave.id);
      if (studentIndex !== -1) {
        targetClass.students[studentIndex] = studentToSave; // Cập nhật học sinh
      } else {
        targetClass.students.push(studentToSave); // Thêm mới học sinh
      }

      await AsyncStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(allClasses));

      if (onSave) onSave(studentToSave);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Lỗi khi lưu học bạ:', error);
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmSave = () => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn lưu học bạ của ${editableStudent.name} vào lớp ${getHighestClass(editableStudent.classList)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: saveStudentReport },
      ]
    );
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.imagePreview} />
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBackPress}>
          <FontAwesome name="arrow-left" size={24} color="#1E88E5" />
        </TouchableOpacity>
        <Text style={styles.header}>Thông tin học bạ</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarFrame}>
            <Image source={require('../../../assets/images/user.png')} style={styles.avatar} />
          </View>
          {images.length > 0 && (
            <TouchableOpacity style={styles.viewFileButton} onPress={() => setShowImagesModal(true)}>
              <Text style={styles.viewFileText}>Xem ảnh học bạ</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Họ tên: {editableStudent.name || 'N/A'}</Text>
          <View style={styles.line} />
          <Text style={styles.infoText}>Giới tính: {editableStudent.gender || 'N/A'}</Text>
          <View style={styles.line} />
          <Text style={styles.infoText}>Ngày sinh: {editableStudent.dob || 'N/A'}</Text>
          <View style={styles.line} />
          <Text style={styles.infoText}>Trường: {editableStudent.school || 'N/A'}</Text>
          <View style={styles.line} />
          <Text style={styles.infoText}>SĐT: {editableStudent.phone || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRowHeader}>
          <Text style={styles.tableHeader}>Môn học</Text>
          <Text style={styles.tableHeader}>HK1</Text>
          <Text style={styles.tableHeader}>HK2</Text>
          <Text style={styles.tableHeader}>CN</Text>
        </View>

        {selectedSubjects.length > 0 ? (
          selectedSubjects.map((subject, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{subject.name}</Text>
              <Text style={styles.tableCell}>{subject.hk1}</Text>
              <Text style={styles.tableCell}>{subject.hk2}</Text>
              <Text style={styles.tableCell}>{subject.cn}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có dữ liệu môn học</Text>
        )}
      </View>

      <View style={styles.evaluation}>
        <Text style={styles.evaluationText}>Học lực: {editableStudent.academicPerformance || 'N/A'}</Text>
        <Text style={styles.evaluationText}>Hạnh kiểm: {editableStudent.conduct || 'N/A'}</Text>
      </View>

      {isEditMode && (
        <TouchableOpacity style={styles.button} onPress={handleConfirmSave} disabled={isSaving}>
          <LinearGradient
            colors={['#32ADE6', '#2138AA']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSaving ? (
              <Text style={styles.saveText}>Đang lưu...</Text>
            ) : (
              <Text style={styles.saveText}>Lưu học bạ</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lưu học bạ thành công!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleSuccessClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lỗi khi lưu học bạ. Vui lòng thử lại.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showImagesModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ảnh học bạ</Text>
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              contentContainerStyle={styles.imageList}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowImagesModal(false)}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E88E5',
    textAlign: 'center',
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  avatarFrame: {
    width: 100,
    height: 120,
    borderWidth: 2,
    borderColor: '#1E88E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  viewFileButton: {
    marginTop: 10,
    backgroundColor: '#1E88E5',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewFileText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 3,
  },
  line: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E88E5',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  tableHeader: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  evaluation: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  evaluationText: {
    fontSize: 16,
    color: '#0D47A1',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageList: {
    alignItems: 'center',
  },
  imagePreview: {
    width: Dimensions.get('window').width / 2 - 30,
    height: 150,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  closeButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'center',
    width: '50%',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default StudentReportCard;
