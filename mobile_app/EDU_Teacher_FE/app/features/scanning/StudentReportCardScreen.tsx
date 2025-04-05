import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import StudentReportCardComponent from './studentReportCard';
import { NavigationProp } from '@react-navigation/native';

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

// Định nghĩa RootStackParamList
type RootStackParamList = {
  StudentReportCard: {
    student: string;
    className: string;
    isEditMode: string;
  };
  ClassListScreen: undefined;
};

// Sử dụng NavigationProp với RootStackParamList
type StudentReportCardNavigationProp = NavigationProp<RootStackParamList, 'StudentReportCard'>;

export default function StudentReportCardScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation<StudentReportCardNavigationProp>(); // Chỉ định kiểu cho navigation

  const { student, className, isEditMode } = params;

  // console.log('Params received:', params);

  if (!student || !className) {
    console.error('Missing required params:', params);
    navigation.goBack();
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Lỗi: Thiếu dữ liệu cần thiết.</Text>
      </View>
    );
  }

  let studentData: StudentItem | undefined;
  try {
    studentData = JSON.parse(student as string) as StudentItem;
    // console.log('Parsed studentData:', studentData);
  } catch (error) {
    console.error('Error parsing student data:', error);
    navigation.goBack();
    return null;
  }

  return (
    <StudentReportCardComponent
      studentData={studentData}
      className={className as string}
      isEditMode={isEditMode === 'true'}
      navigation={navigation} // Truyền navigation với kiểu đã định nghĩa
      onSave={() => navigation.goBack()}
    />
  );
}
