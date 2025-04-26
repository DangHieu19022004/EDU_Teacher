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
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

const CLASS_STORAGE_KEY = '@student_classes';
const BASE_URL = "http://192.168.1.164:8000/";
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
    setEditableStudent(studentData);
  }, [studentData]);

  if (!editableStudent || !editableStudent.name || editableStudent.name.trim() === '' || editableStudent.name === 'Chưa rõ') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lỗi: Dữ liệu học sinh không hợp lệ.</Text>
      </View>
    );
  }


  const selectedClassData = editableStudent.classList?.find((cls) => cls.class.trim() === className.trim());
  const selectedSubjects = selectedClassData?.subjects || editableStudent.subjects || [];
  const images = editableStudent.images || [];

  const updateStudentField = (field: keyof StudentItem, value: string) => {
    setEditableStudent((prev) => ({ ...prev, [field]: value }));
  };

  const updateSubject = (index: number, field: keyof Subject, value: string) => {
    const updatedSubjects = [...selectedSubjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setEditableStudent((prev) => ({
      ...prev,
      classList: prev.classList?.map((cls) =>
        cls.class === className ? { ...cls, subjects: updatedSubjects } : cls
      ),
    }));
  };

  const getHighestClass = (classList: ClassData[] | undefined): string => {
    if (!classList || classList.length === 0) return 'Unknown';

    const classNumbers = classList.map((cls) => {
      const match = cls.class.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });

    const maxClassNum = Math.max(...classNumbers);
    const highestClass = classList.find((cls) => cls.class.includes(maxClassNum.toString()));
    return highestClass ? highestClass.class : classList[0].class;
  };

  const saveStudentReport = async () => {
    setIsSaving(true);
    try {
      const payload = {
        student: {
          id: editableStudent.id,
          name: editableStudent.name,
          dob: editableStudent.dob,
          gender: editableStudent.gender,
          phone: editableStudent.phone,
          school: editableStudent.school,
          address: '',
          parents_email: '',
          class_id: '',
          father_name: '',
          mother_name: '',
          guardian_name: '',
          guardian_job: '',
          ethnicity: '',
          birthplace: '',
        },
        report_card: {
          class_id: '',
          school_year: '2022-2025',
          conduct_year1_sem1: editableStudent.conduct,
          conduct_year1_sem2: editableStudent.conduct,
          conduct_year1_final: editableStudent.conduct,
          conduct_year2_sem1: '',
          conduct_year2_sem2: '',
          conduct_year2_final: '',
          conduct_year3_sem1: '',
          conduct_year3_sem2: '',
          conduct_year3_final: '',
          academic_perform_year1: editableStudent.academicPerformance,
          academic_perform_year2: '',
          academic_perform_year3: '',
          gpa_avg_year1: 0,
          gpa_avg_year2: 0,
          gpa_avg_year3: 0,
          promotion_status: '',
          teacher_comment: '',
          teacher_signed: false,
          principal_signed: false,
        },
        subjects: selectedSubjects.map(sub => ({
          name: sub.name,
          year: 1, // lớp 10
          year1_sem1_score: parseFloat(sub.hk1 || "0"),
          year1_sem2_score: parseFloat(sub.hk2 || "0"),
          year1_final_score: parseFloat(sub.cn || "0"),
          year2_sem1_score: null,
          year2_sem2_score: null,
          year2_final_score: null,
          year3_sem1_score: null,
          year3_sem2_score: null,
          year3_final_score: null,
        })),
      };

      const response = await fetch(`${BASE_URL}ocr/save_full_report_card/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Lưu thất bại');
      }
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
    navigation.goBack(); // Navigate back only after modal is dismissed
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
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
          <TextInput
            style={styles.input}
            value={editableStudent.name || ''}
            onChangeText={(text) => updateStudentField('name', text)}
            placeholder="Họ tên"
            editable={isEditMode}
          />
          <View style={styles.line} />
          <TextInput
            style={styles.input}
            value={editableStudent.gender || ''}
            onChangeText={(text) => updateStudentField('gender', text)}
            placeholder="Giới tính"
            editable={isEditMode}
          />
          <View style={styles.line} />
          <TextInput
            style={styles.input}
            value={editableStudent.dob || ''}
            onChangeText={(text) => updateStudentField('dob', text)}
            placeholder="Ngày sinh"
            editable={isEditMode}
          />
          <View style={styles.line} />
          <TextInput
            style={styles.input}
            value={editableStudent.school || ''}
            onChangeText={(text) => updateStudentField('school', text)}
            placeholder="Trường"
            editable={isEditMode}
          />
          <View style={styles.line} />
          <TextInput
            style={styles.input}
            value={editableStudent.phone || ''}
            onChangeText={(text) => updateStudentField('phone', text)}
            placeholder="SĐT"
            keyboardType="phone-pad"
            editable={isEditMode}
          />
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
              <TextInput
                style={styles.tableInput}
                value={subject.name || ''}
                onChangeText={(text) => updateSubject(index, 'name', text)}
                placeholder="Môn học"
                editable={isEditMode}
              />
              <TextInput
                style={styles.tableInput}
                value={subject.hk1 || ''}
                onChangeText={(text) => updateSubject(index, 'hk1', text)}
                placeholder="HK1"
                keyboardType="numeric"
                editable={isEditMode}
              />
              <TextInput
                style={styles.tableInput}
                value={subject.hk2 || ''}
                onChangeText={(text) => updateSubject(index, 'hk2', text)}
                placeholder="HK2"
                keyboardType="numeric"
                editable={isEditMode}
              />
              <TextInput
                style={styles.tableInput}
                value={subject.cn || ''}
                onChangeText={(text) => updateSubject(index, 'cn', text)}
                placeholder="CN"
                keyboardType="numeric"
                editable={isEditMode}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có dữ liệu môn học</Text>
        )}
      </View>

      <View style={styles.evaluation}>
        <TextInput
          style={styles.input}
          value={editableStudent.academicPerformance || ''}
          onChangeText={(text) => updateStudentField('academicPerformance', text)}
          placeholder="Học lực"
          editable={isEditMode}
        />
        <TextInput
          style={styles.input}
          value={editableStudent.conduct || ''}
          onChangeText={(text) => updateStudentField('conduct', text)}
          placeholder="Hạnh kiểm"
          editable={isEditMode}
        />
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

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        message="Lưu học bạ thành công"
      />

      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorClose}
        message="Không thành công"
        subMessage="Vui lòng thử lại"
      />

    <Modal visible={showImagesModal} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ảnh học bạ</Text>

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.imageSlide}>
                <Image source={{ uri: item }} style={styles.fullImage} resizeMode="contain" />
              </View>
            )}
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
  imageSlide: {
    width: Dimensions.get('window').width - 40,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
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
  input: {
    fontSize: 16,
    color: '#333',
    marginVertical: 3,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
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
  tableInput: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    margin: 2,
    padding: 5,
  },
  evaluation: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
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
