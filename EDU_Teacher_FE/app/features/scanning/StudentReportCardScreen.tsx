import React, { useEffect } from 'react';
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

type RootStackParamList = {
  StudentReportCard: {
    student: string;
    className: string;
    isEditMode: string;
  };
  ClassListScreen: undefined;
};

type StudentReportCardNavigationProp = NavigationProp<RootStackParamList, 'StudentReportCard'>;

export default function StudentReportCardScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation<StudentReportCardNavigationProp>();
  // const { student, className: passedClassName, isEditMode } = params;
  const student = params['student'];
  const passedClassName = params['className'];
  const isEditMode = params['isEditMode'];
  const reportCardId = params['reportCardId'];


  const [parsedStudent, setParsedStudent] = React.useState<StudentItem | null>(null);
  const [resolvedClassName, setResolvedClassName] = React.useState<string>('');

  useEffect(() => {
    if (!student) {
      console.error('❌ Missing student param.');
      navigation.goBack();
      return;
    }

    try {
      const parsed = JSON.parse(student as string) as StudentItem;
      setParsedStudent(parsed);
      setResolvedClassName((passedClassName as string) || (parsed.classList?.[0]?.class ?? ''));
    } catch (error) {
      console.error('❌ Error parsing student data:', error);
      navigation.goBack();
    }
  }, [student, passedClassName]);

  if (!parsedStudent || resolvedClassName === '') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Đang tải dữ liệu học sinh...</Text>
      </View>
    );
  }

  return (
    <StudentReportCardComponent
      studentData={parsedStudent}
      className={resolvedClassName}
      isEditMode={isEditMode === 'true'}
      reportCardId={reportCardId as string}
      navigation={navigation}
      onSave={() => navigation.goBack()}
    />
  );
}
