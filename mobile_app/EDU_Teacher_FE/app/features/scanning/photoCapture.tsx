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

const BASE_URL = "http://192.168.1.185:8000/";

const uploadAndProcessImage = async (imageUri: string): Promise<any[]> => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await fetch(`${BASE_URL}ocr/detect/`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.ok) {
    throw new Error('Lỗi server khi xử lý ảnh');
  }

  const data = await response.json();
  return data.results; // Array of { image_url, ocr_data }
};

const PhotoCaptureScreen: React.FC = () => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [processedResults, setProcessedResults] = useState<any[]>([]);
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
      const imageUri = result.assets[0].uri;
      setIsProcessing(true); // Bật loading
      try {
        const results = await uploadAndProcessImage(imageUri);
        console.log('📥 Kết quả từ server:', results);
        setProcessedResults((prev) => [...prev, ...results]);
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Xử lý ảnh thất bại.');
      } finally {
        setIsProcessing(false); // Tắt loading
      }
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
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setIsProcessing(true); // Bật loading
      try {
        const results = await uploadAndProcessImage(imageUri);
        setProcessedResults((prev) => [...prev, ...results]);
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Xử lý ảnh thất bại.');
      } finally {
        setIsProcessing(false); // Tắt loading
      }
    }
  };

  const deleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (processedResults.length === 0) {
      Alert.alert('Thông báo', 'Bạn chưa xử lý ảnh nào!');
      return;
    }

    // Tạo dữ liệu học sinh từ kết quả OCR
    const ocrSubjects = processedResults.flatMap(result =>
      result.ocr_data.map((row: any) => ({
        name: row.ten_mon || 'Môn học',
        hk1: row.hky1 || '0',
        hk2: row.hky2 || '0',
        cn: row.ca_nam || '0'
      }))
    );

    const studentDataWithOCR: StudentItem = {
      ...sampleStudentData, // Giữ các thông tin cơ bản từ sample data
      classList: [{
        class: sampleStudentData.classList?.[0]?.class || '10D5', // Giữ lớp mặc định hoặc từ sample data
        subjects: ocrSubjects // Sử dụng dữ liệu môn học từ OCR
      }],
      images: processedResults.map(result => `${BASE_URL}${result.image_url.replace(/^\/+/, '')}`) // Lưu URL ảnh
    };

    router.push({
      pathname: '/features/scanning/StudentReportCardScreen',
      params: {
        student: JSON.stringify(studentDataWithOCR),
        className: studentDataWithOCR.classList[0].class,
        isEditMode: 'true',
      },
    });
  };

  // Thêm nút "Tiếp theo" khi có dữ liệu OCR
  const renderNextButton = () => {
    if (processedResults.length > 0) {
      return (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isProcessing}
        >
          <Text style={styles.nextButtonText}>
            {isProcessing ? 'Đang xử lý...' : 'Xem bảng điểm'}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.thumbnail} />
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImage(index)}>
        <FontAwesome name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Loading Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isProcessing}
        onRequestClose={() => setIsProcessing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#32ADE6" />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chụp ảnh học bạ</Text>
      </View>

      <TouchableOpacity style={styles.captureButton} onPress={openCamera}>
        <FontAwesome name="camera" size={30} color="white" />
        <Text style={styles.captureButtonText}>Chụp ảnh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromLibrary}>
        <FontAwesome name="photo" size={28} color="white" />
        <Text style={styles.galleryButtonText}>Chọn ảnh từ thiết bị</Text>
      </TouchableOpacity>

      {processedResults.length > 0 ? (
        <>
          <FlatList
            data={processedResults}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <Image
                  source={{ uri: `${BASE_URL}${item.image_url.replace(/^\/+/, '')}` }}
                  style={styles.processedImage}
                />
                <Text style={styles.resultTitle}>Kết quả nhận diện:</Text>
                {item.ocr_data.map((row: any, index: number) => (
                  <Text key={index} style={styles.resultText}>
                    • {row.ten_mon || 'Môn học'}: HK1 {row.hky1 || '0'} - HK2 {row.hky2 || '0'} - CN {row.ca_nam || '0'}
                  </Text>
                ))}
              </View>
            )}
          />
          {renderNextButton()}
        </>
      ) : (
        <Text style={styles.noImageText}>Chưa có ảnh nào được xử lý</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
