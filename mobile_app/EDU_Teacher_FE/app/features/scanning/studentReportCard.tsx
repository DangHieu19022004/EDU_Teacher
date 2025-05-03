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
  reportCardId?: string;
}

const StudentReportCard = ({
  studentData,
  className,
  onSave,
  isEditMode = false,
  navigation,
  reportCardId,
}: StudentReportCardProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [editableStudent, setEditableStudent] = useState<StudentItem>(studentData);
  const [selectedClass, setSelectedClass] = useState('10');
  const [teacherClasses, setTeacherClasses] = useState<{ id: string; name: string; school_name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (studentData) {
      const cleanedStudent = { ...studentData };

      if (cleanedStudent.classList && cleanedStudent.classList.length > 0) {
        cleanedStudent.classList = cleanedStudent.classList.map(cls => {
          const subjects = [...cls.subjects]
            .map(sub => ({
              ...sub,
              name: sanitizeSubjectName(sub.name) // 🔵 sanitize ngay lần đầu
            }));

          // Tính lại DTB
          const averageRow = calculateAverageSubjects(subjects);

          return {
            ...cls,
            subjects: [...subjects, averageRow],
          };
        });
      }
      const fetchTeacherClasses = async () => {
        if (!user?.uid) return;
        try {
          const response = await fetch(`${BASE_URL}classroom/get_classrooms/?teacher_id=${user.uid}`, {
            headers: {
              Authorization: `Bearer ${user.uid}`,
            },
          });
          const data = await response.json();
          if (response.ok) setTeacherClasses(data);
          else console.error('Không lấy được danh sách lớp:', data);
        } catch (error) {
          console.error('Lỗi khi gọi API lớp:', error);
        }
      };
      fetchTeacherClasses();

      if (cleanedStudent.classList && cleanedStudent.classList.length > 0) {
        const highestClass = getHighestClass(cleanedStudent.classList);
        setSelectedClass(highestClass.match(/\d+/)?.[0] || '10');
      }
      setEditableStudent(cleanedStudent);
    }
  }, [studentData]);

  useEffect(() => {
    if (isEditMode && teacherClasses.length > 0 && editableStudent?.classList?.length > 0) {
      const studentClassName = editableStudent.classList[0].class?.trim();
      const matchedClass = teacherClasses.find(cls => cls.name.trim() === studentClassName);

      if (matchedClass) {
        setSelectedClassId(matchedClass.id);
        updateStudentField('school', matchedClass.school_name);
      } else {
        console.warn("Không tìm thấy lớp khớp trong danh sách teacherClasses:", studentClassName);
      }
    }

  }, [isEditMode, teacherClasses, editableStudent?.classList]);



  const sanitizeSubjectName = (name: string) => {
    // Nếu tên có dấu ":", thì chỉ lấy phần trước dấu ":"
    if (name.includes(':')) {
      return name.split(':')[0].trim();
    }
    return name.trim();
  };

  if (!editableStudent || !editableStudent.name || editableStudent.name.trim() === '' || editableStudent.name === 'Chưa rõ') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lỗi: Dữ liệu học sinh không hợp lệ.</Text>
      </View>
    );
  }

  function calculateAverageSubjects(subjects: Subject[]) {
    if (!subjects || subjects.length === 0) return { name: 'DTB các môn', hk1: '0', hk2: '0', cn: '0' };

    // Xóa dòng đầu nếu rác
    const first = subjects[0];
    if (first && (
      first.name.toLowerCase().includes('học') ||
      first.name.toLowerCase().includes('các môn') ||
      first.name.toLowerCase().includes('dtb')
    )) {
      subjects.shift();
    }

    // Xóa dòng cuối nếu rác
    const last = subjects[subjects.length - 1];
    if (last && (
      last.name.toLowerCase().includes('học') ||
      last.name.toLowerCase().includes('các môn') ||
      last.name.toLowerCase().includes('dtb')
    )) {
      subjects.pop();
    }

    const isNumeric = (value: string) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value));

    let sumHK1 = 0, sumHK2 = 0, sumCN = 0;
    let count = 0;

    subjects.forEach(sub => {
      if (isNumeric(sub.hk1) && isNumeric(sub.hk2) && isNumeric(sub.cn)) {
        sumHK1 += parseFloat(sub.hk1);
        sumHK2 += parseFloat(sub.hk2);
        sumCN += parseFloat(sub.cn);
        count += 1;
      }
    });

    if (count === 0) count = 1; // tránh chia 0

    return {
      name: 'DTB các môn',
      hk1: (sumHK1 / count).toFixed(1),
      hk2: (sumHK2 / count).toFixed(1),
      cn: (sumCN / count).toFixed(1),
    };
  }


  const selectedClassData = editableStudent.classList?.find((cls) => {
    const classNumber = cls.class.match(/\d+/)?.[0] || '';
    return classNumber === selectedClass;
  });
  const selectedSubjects = selectedClassData?.subjects || [];

  const images = editableStudent.images || [];

  const updateStudentField = (field: keyof StudentItem, value: string) => {
    setEditableStudent((prev) => ({ ...prev, [field]: value }));
  };

  const updateSubject = (index: number, field: keyof Subject, value: string) => {
    setEditableStudent(prev => {
      const updatedClassList = prev.classList?.map(cls => {
        if (!cls.class.includes(selectedClass)) return cls;

        const updatedSubjects = [...cls.subjects];

        // Cập nhật môn học đang chỉnh
        if (updatedSubjects[index]) {
          updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
        }

        // Xóa dòng đầu (nếu là học/các môn) và dòng cuối (nếu là các môn/DTB) để không ảnh hưởng
        const first = updatedSubjects[0];
        if (first && (
          first.name.toLowerCase().includes('học') ||
          first.name.toLowerCase().includes('các môn') ||
          first.name.toLowerCase().includes('dtb')
        )) {
          updatedSubjects.shift();
        }
        const last = updatedSubjects[updatedSubjects.length - 1];
        if (last && (
          last.name.toLowerCase().includes('học') ||
          last.name.toLowerCase().includes('các môn') ||
          last.name.toLowerCase().includes('dtb')
        )) {
          updatedSubjects.pop();
        }

        // Tính lại điểm trung bình sau khi người dùng chỉnh sửa
        const averageRow = calculateAverageSubjects(updatedSubjects);

        return {
          ...cls,
          subjects: [...updatedSubjects, averageRow],
        };
      }) || [];

      return { ...prev, classList: updatedClassList };
    });
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

  const handleConfirmSave = async () => {
    const method = reportCardId ? 'PUT' : 'POST';
    const url = reportCardId
      ? `${BASE_URL}ocr/update_report_card/?id=${reportCardId}`
      : `${BASE_URL}ocr/save_full_report_card/`;
    if (!editableStudent.classList || editableStudent.classList.length === 0) {
      Alert.alert('Lỗi', 'Không có dữ liệu môn học.');
      return;
    }
    if (!selectedClassId) {
      Alert.alert('Lỗi', 'Vui lòng chọn lớp trước khi lưu.');
      return;
    }
    const allSubjects = editableStudent.classList?.flatMap(cls =>
      cls.subjects.map(sub => {
        const year = cls.class.includes('10') ? 1 : cls.class.includes('11') ? 2 : 3;
        return {
          name: sanitizeSubjectName(sub.name),
          year,
          year1_sem1_score: year === 1 ? parseFloat(sub.hk1 || "0") : null,
          year1_sem2_score: year === 1 ? parseFloat(sub.hk2 || "0") : null,
          year1_final_score: year === 1 ? parseFloat(sub.cn || "0") : null,
          year2_sem1_score: year === 2 ? parseFloat(sub.hk1 || "0") : null,
          year2_sem2_score: year === 2 ? parseFloat(sub.hk2 || "0") : null,
          year2_final_score: year === 2 ? parseFloat(sub.cn || "0") : null,
          year3_sem1_score: year === 3 ? parseFloat(sub.hk1 || "0") : null,
          year3_sem2_score: year === 3 ? parseFloat(sub.hk2 || "0") : null,
          year3_final_score: year === 3 ? parseFloat(sub.cn || "0") : null,
        };
      })
    ) || [];



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
          class_id: selectedClassId || '',
          father_name: '',
          mother_name: '',
          guardian_name: '',
          guardian_job: '',
          ethnicity: '',
          birthplace: '',
        },
        report_card: {
          class_id: selectedClassId || '',
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
        subjects: allSubjects,
      };
      console.log('uid', user?.uid);
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.uid}`, },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Lưu thất bại');
      }
    } catch (error) {
      console.error('Lỗi lưu học bạ:', error);
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBackPress}>
          <FontAwesome name="arrow-left" size={24} color="#1E88E5" />
        </TouchableOpacity>
        <Text style={styles.header}>Thông tin học bạ</Text>
        {!isEditMode && (
          <Text style={styles.subHeader}>Lớp {className}</Text>
        )}
        <View style={{ width: 24 }} />
      </View>

      {/* Profile + ảnh học bạ */}
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

        {/* Thông tin sinh viên */}
        <View style={styles.infoContainer}>
          <TextInput style={styles.input} value={editableStudent.name || ''} onChangeText={(text) => updateStudentField('name', text)} placeholder="Họ tên" editable={isEditMode} />
          <View style={styles.line} />
          <TextInput style={styles.input} value={editableStudent.gender || ''} onChangeText={(text) => updateStudentField('gender', text)} placeholder="Giới tính" editable={isEditMode} />
          <View style={styles.line} />
          <TextInput style={styles.input} value={editableStudent.dob || ''} onChangeText={(text) => updateStudentField('dob', text)} placeholder="Ngày sinh" editable={isEditMode} />
          <View style={styles.line} />
          {isEditMode && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Chọn lớp</Text>
              <ScrollView horizontal>
                {teacherClasses.map(cls => (
                  <TouchableOpacity
                    key={cls.id}
                    style={{
                      borderWidth: 1,
                      borderColor: '#1E88E5',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      marginRight: 10,
                      backgroundColor: editableStudent.classList?.[0]?.class === cls.name ? '#1E88E5' : 'white',
                    }}
                    onPress={() => {
                      updateStudentField('school', cls.school_name);
                      setSelectedClassId(cls.id);
                      setEditableStudent(prev => {
                        const existing = prev.classList || [];

                        // Kiểm tra xem lớp đã tồn tại chưa
                        const found = existing.find(c => c.class === cls.name);

                        let newClassList: ClassData[];

                        if (found) {
                          newClassList = existing;
                        } else {
                          newClassList = [...existing, { class: cls.name, subjects: [] }];
                        }

                        return {
                          ...prev,
                          classList: newClassList,
                        };
                      });
                    }}

                  >
                    <Text style={{ color: editableStudent.classList?.[0]?.class === cls.name ? 'white' : '#1E88E5' }}>
                      {cls.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <TextInput style={styles.input} value={editableStudent.school || ''} onChangeText={(text) => updateStudentField('school', text)} placeholder="Trường" editable={isEditMode} />
          <View style={styles.line} />
          <TextInput style={styles.input} value={editableStudent.phone || ''} onChangeText={(text) => updateStudentField('phone', text)} placeholder="SĐT" keyboardType="phone-pad" editable={isEditMode} />
        </View>
      </View>

      {/* Nút chọn lớp */}
      <View style={styles.gradeSwitchContainer}>
        {['10', '11', '12'].map((grade) => (
          <TouchableOpacity
            key={grade}
            style={[styles.gradeButton, selectedClass === grade && styles.selectedGradeButton]}
            onPress={() => setSelectedClass(grade)}
          >
            <Text style={[styles.gradeButtonText, selectedClass === grade && styles.selectedGradeButtonText]}>
              Lớp {grade}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bảng điểm theo lớp đã chọn */}
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
          <Text style={styles.emptyText}>Chưa có dữ liệu môn học cho lớp {selectedClass}</Text>
        )}
      </View>

      {/* Học lực và Hạnh kiểm */}
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

      {/* Nút Lưu */}
      {isEditMode && (
        <TouchableOpacity style={styles.button} onPress={handleConfirmSave} disabled={isSaving}>
          <LinearGradient colors={['#32ADE6', '#2138AA']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.saveText}>{isSaving ? 'Đang lưu...' : 'Lưu học bạ'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Modal success/error */}
      <SuccessModal visible={showSuccessModal} onClose={() => { setShowSuccessModal(false) }} message="Lưu học bạ thành công" />
      <ErrorModal visible={showErrorModal} onClose={() => setShowErrorModal(false)} message="Không thành công" subMessage="Vui lòng thử lại" />

      {/* Modal xem ảnh học bạ */}
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
  gradeSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  gradeButton: {
    borderWidth: 1,
    borderColor: '#1E88E5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
  },

  selectedGradeButton: {
    backgroundColor: '#1E88E5',
  },

  gradeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E88E5',
  },

  selectedGradeButtonText: {
    color: 'white',
  },
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
