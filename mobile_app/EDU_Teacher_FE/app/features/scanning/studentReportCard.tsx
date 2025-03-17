import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from "expo-linear-gradient";
import SuccessOverlay from "./overlay/successOverlay";
import sampleStudentData from '../../test_data/studentData';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';

const StudentReportCard = ({ studentData = sampleStudentData }) => {
  const { imageUris } = useLocalSearchParams<{ imageUris: string }>(); // Nhận danh sách ảnh từ params
  const images = imageUris ? JSON.parse(imageUris) : []; // Parse chuỗi JSON thành mảng

  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const showOverlay = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  const [selectedClass, setSelectedClass] = useState(studentData.classList[1].class);
  const selectedSubjects = studentData.classList.find(cls => cls.class === selectedClass)?.subjects || [];

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showImages, setShowImages] = useState(false); // Trạng thái để hiển thị modal ảnh

  const renderImageItem = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.imagePreview} />
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.statusBar}></View>

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
          <Text style={styles.backText}>{'\u25C0'}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Thông tin học bạ</Text>
        <Text style={styles.justify}>aaa</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarFrame}>
            <Image source={require('../../../assets/images/user.png')} style={styles.avatar} />
          </View>
          <TouchableOpacity style={styles.viewFileButton} onPress={() => setShowImages(true)}>
            <Text style={styles.viewFileText}>Xem file gốc</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Họ tên: {studentData.name}</Text>
          <View style={styles.line} />
          <Text style={styles.infoText}>Giới tính: {studentData.gender}</Text>
          <View style={styles.line} />
          <Text style={styles.infoText}>Ngày sinh: {studentData.dob}</Text>
          <View style={styles.line} />
          <Text style={styles.infoText}>Trường: {studentData.school}</Text>
          <View style={styles.line} />
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedClass}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedClass(itemValue)}
        >
          {studentData.classList.map((cls, index) => (
            <Picker.Item key={index} label={cls.class} value={cls.class} />
          ))}
        </Picker>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRowHeader}>
          <Text style={styles.tableHeader}>Môn học</Text>
          <Text style={styles.tableHeader}>HK1</Text>
          <Text style={styles.tableHeader}>HK2</Text>
          <Text style={styles.tableHeader}>CN</Text>
        </View>
        {selectedSubjects.map((subject, subIndex) => (
          <View key={subIndex} style={styles.tableRow}>
            <Text style={styles.tableCell}>{subject.name}</Text>
            <Text style={styles.tableCell}>{subject.hk1}</Text>
            <Text style={styles.tableCell}>{subject.hk2}</Text>
            <Text style={styles.tableCell}>{subject.cn}</Text>
          </View>
        ))}
      </View>

      <View style={styles.evaluation}>
        <Text style={styles.evaluationText}>Học lực: {studentData.academicPerformance}</Text>
        <Text style={styles.evaluationText}>Hạnh kiểm: {studentData.conduct}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setOverlayVisible(true)}>
        <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.saveText}>Lưu học bạ</Text>
        </LinearGradient>
        <SuccessOverlay visible={overlayVisible} onClose={() => setOverlayVisible(false)} />
      </TouchableOpacity>

      {/* Modal hiển thị ảnh */}
      <Modal visible={showImages} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ảnh đã chụp</Text>
            {images.length > 0 ? (
              <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                style={styles.imageList}
              />
            ) : (
              <Text style={styles.noImageText}>Không có ảnh nào</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowImages(false)}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pickerContainer: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#1E88E5', backgroundColor: '#E3F2FD', marginBottom: 10 },
  picker: { height: 50, width: "100%", color: '#1E88E5' },
  justify: { color: "white" },
  line: { width: "100%", height: 3, backgroundColor: "#D9D9D9", marginVertical: 2 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  headerContainer: { flexDirection: 'row', marginBottom: 16, width: "100%", justifyContent: "space-between" },
  backButton: { marginRight: 10 },
  backText: { fontSize: 20, color: '#1E88E5' },
  header: { fontSize: 30, fontWeight: 'bold', color: '#1E88E5' },
  profileContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, marginBottom: 16 },
  avatarContainer: { alignItems: 'center', marginRight: 16 },
  avatarFrame: { width: 100, height: 150, borderWidth: 2, borderColor: '#1E88E5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#BDBDBD' },
  viewFileButton: { marginTop: 8, backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  viewFileText: { color: 'white', fontSize: 12 },
  infoContainer: { flex: 1 },
  infoText: { fontSize: 16, color: '#0D47A1', marginBottom: 4 },
  tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  tab: { padding: 10, backgroundColor: '#E3F2FD', marginHorizontal: 5, borderRadius: 4 },
  tabActive: { padding: 10, backgroundColor: '#1E88E5', marginHorizontal: 5, borderRadius: 4 },
  tabText: { color: '#0D47A1', fontWeight: 'bold' },
  table: { borderWidth: 1, borderColor: '#0D47A1', borderRadius: 4, marginBottom: 16 },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#1E88E5', padding: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#BBDEFB', padding: 8 },
  tableHeader: { flex: 1, textAlign: 'center', color: 'white', fontWeight: 'bold' },
  tableCell: { flex: 1, textAlign: 'center', color: '#0D47A1' },
  evaluation: { padding: 10, backgroundColor: '#E3F2FD', borderRadius: 4, marginBottom: 16 },
  evaluationText: { fontSize: 16, color: '#0D47A1', fontWeight: 'bold' },
  button: { width: "100%", padding: 10, borderRadius: 10, overflow: "hidden" },
  gradient: { paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  statusBar: { height: 30 },
  // Styles cho modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E88E5',
  },
  imageList: {
    width: '100%',
  },
  imagePreview: {
    width: Dimensions.get('window').width / 2 - 40, // Chia đôi màn hình, trừ padding
    height: 150,
    margin: 5,
    borderRadius: 5,
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentReportCard;
