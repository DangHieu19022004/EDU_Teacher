import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Alert } from 'react-native';
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

const BASE_URL = "http://192.168.100.225:8000/";



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
      try {
        const results = await uploadAndProcessImage(imageUri);
        console.log('📥 Kết quả từ server:', results);
        setProcessedResults((prev) => [...prev, ...results]);
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Xử lý ảnh thất bại.');
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
      try {
        const results = await uploadAndProcessImage(imageUri);
        setProcessedResults((prev) => [...prev, ...results]);
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Xử lý ảnh thất bại.');
      }
    }
  };


  const deleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (images.length === 0) {
      Alert.alert('Thông báo', 'Bạn chưa chụp ảnh nào!');
      return;
    }

    const studentDataWithImages: StudentItem = {
      ...sampleStudentData,
      images: images,
    };

    console.log('Navigating with data:', studentDataWithImages);

    router.push({
      pathname: '/features/scanning/StudentReportCardScreen',
      params: {
        student: JSON.stringify(studentDataWithImages),
        className: sampleStudentData.classList?.[0]?.class || '10D5',
        isEditMode: 'true',
      },
    });
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
        <FlatList
          data={processedResults}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 10, backgroundColor: '#fff', padding: 10, borderRadius: 10 }}>
              <Image source={{ uri: `${BASE_URL}${item.image_url.replace(/^\/+/, '')}` }} style={{ height: 200, resizeMode: 'contain', borderRadius: 8 }} />
              <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Dữ liệu OCR:</Text>
              {item.ocr_data.map((row: any, index: number) => (
                <Text key={index}>• {row.ten_mon}: {row.hky1} - {row.hky2} - {row.ca_nam}</Text>
              ))}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noImageText}>Chưa có ảnh nào được chụp</Text>
      )}
      {images.length > 0 && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tiếp theo</Text>
        </TouchableOpacity>
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
});

export default PhotoCaptureScreen;
