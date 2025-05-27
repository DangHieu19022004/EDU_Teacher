import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import sampleStudentData from '../../test_data/studentData.json';
import { BASE_URL } from '@/constants/Config';
import LoadingModal from '../../../components/LoadingModal';
import { LinearGradient } from "expo-linear-gradient";

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

  if (data.results && Array.isArray(data.results)) {
    return data.results.map(result  => {
      if (result.ocr_data && Array.isArray(result.ocr_data)) {
        result.ocr_data = result.ocr_data.map((row: any) => {
          // Xử lý từng cột điểm
          ['hk1', 'hk2', 'cn'].forEach(key => {
            if (row[key] && typeof row[key] === 'string') {
              const lowerValue = row[key].toLowerCase().trim();
              if (lowerValue === 'dat') {
                row[key] = '10';
              } else if (lowerValue === 'khong dat') {
                row[key] = '0';
              }
            }
          });
          return row;
        });
      }
      return result;
    });
  }

  return data.results;
};

const PhotoCaptureScreen: React.FC = () => {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      const newImage = { uri: result.assets[0].uri, type: 'report_card', grade: '10' };
      setImages(prev => [...prev, newImage]);
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
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const toggleType = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index].type = updated[index].type === 'report_card' ? 'student_info' : 'report_card';
      updated[index].grade = updated[index].type === 'student_info' ? 'none' : '10';
      return updated;
    });
  };

  const toggleGrade = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      if (updated[index].type === 'report_card') {
        const current = updated[index].grade;
        updated[index].grade = current === '10' ? '11' : current === '11' ? '12' : '10';
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
      const classSubjects: { [key: string]: any[] } = { '10': [], '11': [], '12': [] };
      let studentInfoExtracted: Partial<StudentItem> = {};

      for (const img of images) {
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

        if (img.type === 'report_card' && (img.grade === '10' || img.grade === '11' || img.grade === '12')) {
          const subjectsFromThisImage = results.flatMap(result =>
            result.ocr_data.map((row: any) => {
              // Xử lý chuyển đổi điểm
              const processScore = (score: string) => {
                if (!score) return '0';
                const lowerScore = score.toLowerCase().trim();
                if (lowerScore === 'dat') return '10';
                if (lowerScore === 'khong dat') return '0';
                return score;
              };

              return {
                name: row.ten_mon || 'Môn học',
                hk1: processScore(row.hky1 || '0'),
                hk2: processScore(row.hky2 || '0'),
                cn: processScore(row.ca_nam || '0'),
              };
            })
          );
          classSubjects[img.grade].push(...subjectsFromThisImage);
        }
      }

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
          { class: '10', subjects: classSubjects['10'] },
          { class: '11', subjects: classSubjects['11'] },
          { class: '12', subjects: classSubjects['12'] },
        ],
        images: allResults.map(result => `${BASE_URL}${result.image_url.replace(/^\/+/, '')}`),
      };

      router.push({
        pathname: '/features/scanning/StudentReportCardScreen',
        params: {
          student: JSON.stringify(studentDataWithOCR),
          className: '10',
          isEditMode: 'true',
        },
      });

    } catch (error) {
      Alert.alert('Lỗi', 'Xử lý ảnh thất bại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const renderImageItem = ({ item, index }: { item: ImageItem; index: number }) => (
    <View style={styles.imageCard}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImage(index)}>
        <FontAwesome name="trash" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.typeSwitchButton} onPress={() => toggleType(index)}>
          <Text style={styles.typeSwitchButtonText}>
            {item.type === 'report_card' ? '📄 Học bạ' : '🧍 Thông tin'}
          </Text>
        </TouchableOpacity>
        {item.type === 'report_card' && (
          <TouchableOpacity style={styles.typeSwitchButton} onPress={() => toggleGrade(index)}>
            <Text style={styles.typeSwitchButtonText}>🎓 Lớp {item.grade}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.captureButton} onPress={openCamera}>
        <LinearGradient colors={["#2138AA", "#32ADE6"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.mainGradient}>
          <FontAwesome name="camera" size={30} color="white" />
          <Text style={styles.captureButtonText}>Chụp ảnh</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromLibrary}>
        <LinearGradient colors={["#2138AA", "#32ADE6"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.mainGradient}>
          <FontAwesome name="photo" size={28} color="white" />
          <Text style={styles.galleryButtonText}>Chọn ảnh từ thiết bị</Text>
        </LinearGradient>
      </TouchableOpacity>

      <FlatList
        data={images}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderImageItem}
      />

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Xem bảng điểm</Text>
      </TouchableOpacity>

      <LoadingModal visible={isProcessing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 10 },
  captureButton: {marginVertical: 10, marginTop: 40, },
  captureButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 10},
  galleryButton: {marginBottom: 10,},
  galleryButtonText: { color: 'white', marginLeft: 10, fontWeight: 'bold' },
  nextButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
  nextButtonText: { color: 'white', fontWeight: 'bold' },
  thumbnail: { width: '100%', height: 150, borderRadius: 10 },
  imageContainer: { flex: 1, marginVertical: 10 },
  deleteButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'red', borderRadius: 20, padding: 5 },
  typeSwitchContainer: { alignItems: 'center', marginTop: 5 },

  typeSwitchButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#1E88E5',
  },
  typeSwitchButtonText: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  imageCard: {
    backgroundColor: '#dcdcdc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  mainGradient: {
    justifyContent: 'center',
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 20,
    flexDirection: 'row',
  },
});

export default PhotoCaptureScreen;
