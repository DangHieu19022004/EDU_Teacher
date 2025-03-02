import React, {useState} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from "expo-linear-gradient";
import SuccessOverlay from "./overlay/successOverlay";

const sampleStudentData = {
    name: 'Hoàng Văn A',
    gender: 'Nam',
    dob: '01/01/2005',
    classList: [
        {class: '10D5',subjects: [
            { name: 'Toán', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Vật lý', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Hóa học', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Ngữ Văn', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Lịch sử', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Địa lý', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Tiếng Anh', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'GDQP', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Công nghệ', hk1: '8.2', hk2: '8.2', cn: '8.2' },
            { name: 'Thể dục', hk1: '8.2', hk2: '8.2', cn: '8.2' },
        ],
        },
        {class: '11D5',subjects: [
            { name: 'Toán', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Vật lý', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Hóa học', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Ngữ Văn', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Lịch sử', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Địa lý', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Tiếng Anh', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'GDQP', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Công nghệ', hk1: '7.2', hk2: '7.2', cn: '7.2' },
            { name: 'Thể dục', hk1: '7.2', hk2: '7.2', cn: '7.2' },
        ],
        },
        {class: '12D5',subjects: [
            { name: 'Toán', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Vật lý', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Hóa học', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Ngữ Văn', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Lịch sử', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Địa lý', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Tiếng Anh', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'GDQP', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Công nghệ', hk1: '9.0', hk2: '9.0', cn: '9.0' },
            { name: 'Thể dục', hk1: '9.0', hk2: '9.0', cn: '9.0' },
        ],
        },
    ],
    school: 'THPT A',

    academicPerformance: 'Giỏi',
    conduct: 'Tốt'
};

const StudentReportCard = ({ studentData = sampleStudentData }) => {
    const [visible, setVisible] = useState(false);

      const showOverlay = () => {
        setVisible(true);
        setTimeout(() => setVisible(false), 3000);
      };

    const [selectedClass, setSelectedClass] = useState(studentData.classList[1].class);

    const selectedSubjects = studentData.classList.find(cls => cls.class === selectedClass)?.subjects || [];

    const [overlayVisible, setOverlayVisible] = useState(false);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backText}>{'\u25C0'}</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Thông tin học bạ</Text>
                <Text style={styles.justify}>aaa</Text>
            </View>




            <View style={styles.profileContainer}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarFrame}>
                        <Image source={require('../assets/images/user.png')} style={styles.avatar} />
                    </View>
                    <TouchableOpacity style={styles.viewFileButton}>
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
                <LinearGradient colors={["#32ADE6", "#2138AA"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
                    <Text style={styles.saveText} >Lưu học bạ</Text>

                </LinearGradient>
                <SuccessOverlay visible={overlayVisible} onClose={() => setOverlayVisible(false)} />
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pickerContainer: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#1E88E5', backgroundColor: '#E3F2FD', marginBottom: 10 },
    picker: { height: 50, width: "100%", color: '#1E88E5' },
    justify:{color:"white"},
    line: {width: "100%", height: 3, backgroundColor: "#D9D9D9", marginVertical: 2,},
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    headerContainer: { flexDirection: 'row', marginBottom: 16, width: "100%", justifyContent:"space-between"},
    backButton: { marginRight: 10 },
    backText: { fontSize: 20, color: '#1E88E5' },
    header: { fontSize: 30, fontWeight: 'bold', color: '#1E88E5',  },
    profileContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, marginBottom: 16 },
    avatarContainer: { alignItems: 'center', marginRight: 16, },
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
    button: { width: "100%", padding:10 , borderRadius: 10, overflow: "hidden",},
    gradient: {paddingVertical: 10, alignItems: "center", borderRadius: 10,},
    saveText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
});


export default StudentReportCard;
