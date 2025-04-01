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

const PhotoCaptureScreen: React.FC = () => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập camera bị từ chối');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImages((prevImages) => [...prevImages, imageUri]);
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
      {images.length > 0 ? (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          style={styles.imageList}
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
