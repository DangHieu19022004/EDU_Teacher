import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Alert, Modal, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import sampleStudentData from '../../test_data/studentData.json';

interface StudentItem {
  id: string;
  name: string;
  gender: string;
  dob: string;
  phone: string;
  school: string;
  academicPerformance: string;
  conduct: string;
  classList: {
    class: string;
    subjects: {
      name: string;
      hk1: string;
      hk2: string;
      cn: string;
    }[];
  }[];
  images?: string[];
}

interface ImageItem {
  uri: string;
  type: 'report_card' | 'student_info';
  grade: '10' | '11' | '12' | 'none';
}

const BASE_URL = "http://192.168.1.164:8000/";

const uploadAndProcessImage = async (imageUri: string, imageType: string): Promise<any[]> => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);
  formData.append('image_type', imageType);

  const response = await fetch(`${BASE_URL}ocr/detect/`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.ok) {
    throw new Error('Lỗi server khi xử lý ảnh');
  }

  const data = await response.json();
  return data.results;
};

const PhotoCaptureScreen: React.FC = () => {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processedResults, setProcessedResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectingGradeIndex, setSelectingGradeIndex] = useState<number | null>(null);

  const handleSelectGrade = (grade: '10' | '11' | '12') => {
    if (selectingGradeIndex !== null) {
      setImages(prev => {
        const updated = [...prev];
        updated[selectingGradeIndex].grade = grade;
        return updated;
      });
      setSelectingGradeIndex(null);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập camera bị từ chối');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImage = { uri: result.assets[0].uri, type: 'report_card', grade: '10'  };
      setImages((prev) => [...prev, newImage]);
      setSelectingGradeIndex(images.length);
    }
  };


  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập thư viện bị từ chối');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => ({ uri: asset.uri, type: 'report_card', grade: '10' }));
      setImages((prev) => [...prev, ...newImages]);
      setSelectingGradeIndex(images.length);
    }
  };

  const deleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const toggleGrade = (index: number) => {
    setImages(prevImages => {
      const updated = [...prevImages];
      if (updated[index].type === 'report_card') {
        const currentGrade = updated[index].grade;
        let nextGrade: '10' | '11' | '12' = '10';
        if (currentGrade === '10') nextGrade = '11';
        else if (currentGrade === '11') nextGrade = '12';
        else if (currentGrade === '12') nextGrade = '10';
        updated[index].grade = nextGrade;
      }
      return updated;
    });
  };


  const toggleType = (index: number) => {
    setImages(prevImages => {
      const updated = [...prevImages];
      if (updated[index].type === 'report_card') {
        updated[index].type = 'student_info';
        updated[index].grade = 'none'; // khi đổi sang thông tin, grade = none
      } else {
        updated[index].type = 'report_card';
        updated[index].grade = '10'; // khi đổi về học bạ, grade = 10
      }
      return updated;
    });
  };



  const handleNext = async () => {
    if (images.length === 0) {
      Alert.alert('Thông báo', 'Bạn chưa chọn ảnh nào!');
      return;
    }

    setIsProcessing(true);
    try {
      const allResults = [];
      let studentInfoExtracted: Partial<StudentItem> = {};

      for (const img of images) {
        const results = await uploadAndProcessImage(img.uri, img.type);
        allResults.push(...results);

        console.log('📄 Kết quả OCR:', results);

        if (img.type === 'student_info') {
          for (const result of results) {
            if (result.student_info) {
              const info = result.student_info;
              studentInfoExtracted = {
                ...studentInfoExtracted,
                name: info.name || '',
                gender: info.gender || '',
                dob: info.dob || '',
                school: info.school || '', // dù không có vẫn không lỗi
              };
              console.log("🧍 Dữ liệu student_info:", info);
            }
          }
        }


      }

      setProcessedResults(allResults);

      const allSubjects = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const grade = img.grade; // '10', '11', '12'
    const results = await uploadAndProcessImage(img.uri, img.type);

    allResults.push(...results);

    if (img.type === 'student_info') {
      for (const result of results) {
        if (result.student_info) {
          const info = result.student_info;
          studentInfoExtracted = {
            ...studentInfoExtracted,
            name: info.name || '',
            gender: info.gender || '',
            dob: info.dob || '',
            school: info.school || '',
          };
        }
      }
    }

    const subjectsFromThisImage = results.flatMap(result =>
      result.ocr_data.map((row: any) => ({
        name: row.ten_mon || 'Môn học',
        hk1: row.hky1 || '0',
        hk2: row.hky2 || '0',
        cn: row.ca_nam || '0',
        year: grade === '10' ? 1 : grade === '11' ? 2 : 3,
      }))
    );

    allSubjects.push(...subjectsFromThisImage);
  }//                         setInitializing(false);


      const studentDataWithOCR: StudentItem = {
        ...sampleStudentData,
        id: Date.now().toString(),
        name: studentInfoExtracted.name ?? sampleStudentData.name,
        gender: studentInfoExtracted.gender || '',
        dob: studentInfoExtracted.dob || '',
        school: studentInfoExtracted.school || '',
        phone: '',
        academicPerformance: '',
        conduct: '',
        classList: [
          {
            class: '10',
            subjects: allSubjects,
          },
        ],
        images: allResults.map(result => `${BASE_URL}${result.image_url.replace(/^\/+/, '')}`),
      };

      console.log('📦 Thông tin học sinh:', studentInfoExtracted);

      router.push({
        pathname: '/features/scanning/StudentReportCardScreen',
        params: {
          student: JSON.stringify(studentDataWithOCR),
          className: studentDataWithOCR.classList[0].class,
          isEditMode: 'true',
        },
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Xử lý ảnh thất bại.');
    } finally {
      setIsProcessing(false);
    }
  };


  const renderImageItem = ({ item, index }: { item: ImageItem; index: number }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImage(index)}>
        <FontAwesome name="trash" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.typeSwitchContainer}>
        <TouchableOpacity onPress={() => toggleType(index)}>
          <Text style={styles.typeSwitchText}>
            {item.type === 'report_card' ? '📄 Học bạ' : '🧍 Thông tin'}
          </Text>
        </TouchableOpacity>

        {/* Chỉ hiện lớp nếu là học bạ */}
        {item.type === 'report_card' && (
        <TouchableOpacity onPress={() => toggleGrade(index)} style={{ marginTop: 5 }}>
          <Text style={styles.typeSwitchText}>🎓 Lớp {item.grade}</Text>
        </TouchableOpacity>
      )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Modal transparent animationType="fade" visible={isProcessing}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#32ADE6" />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.captureButton} onPress={openCamera}>
        <FontAwesome name="camera" size={30} color="white" />
        <Text style={styles.captureButtonText}>Chụp ảnh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromLibrary}>
        <FontAwesome name="photo" size={28} color="white" />
        <Text style={styles.galleryButtonText}>Chọn ảnh từ thiết bị</Text>
      </TouchableOpacity>

      {images.length > 0 ? (
        <>
          <FlatList
            data={images}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderImageItem}
          />
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={isProcessing}>
            <Text style={styles.nextButtonText}>Xem bảng điểm</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noImageText}>Chưa có ảnh nào được chọn</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E88E5',
  },
  gradeButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  gradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeSwitchContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  typeSwitchText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '600'
  },
  galleryButton: {
    backgroundColor: '#6A1B9A',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 10 },
  header: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 5,
  },
  headerTitle: { fontSize: 25, fontWeight: 'bold' },
  captureButton: {
    backgroundColor: '#1E88E5',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  captureButtonText: { color: 'white', fontSize: 16, marginLeft: 10 },
  imageList: { flex: 1 },
  imageContainer: {
    flex: 1,
    margin: 5,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 15,
  },
  noImageText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  processedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    marginBottom: 3,
  },
  // Thêm style cho modal loading
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#32ADE6',
    fontWeight: 'bold',
  },
});

export default PhotoCaptureScreen;
