import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox";
import { Picker } from "@react-native-picker/picker";
import { BASE_URL } from "@/constants/Config";
import { useUser } from "../../contexts/UserContext";
import { ScrollView } from "react-native-gesture-handler";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface ClassItem {
  id: string;
  name: string;
  students: StudentItem[];
}

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
  email: string;
  classList?: ClassData[];
  academicPerformance?: string;
  conduct?: string;
}

interface ParentReceiver {
  id: string;
  parentName: string;
  email: string;
  studentName: string;
  className?: string;
  studentId: string;
}

interface ScheduledEmail {
  id: string;
  subject: string;
  recipients: string;
  message: string;
  scheduledDate: Date;
  status: "pending" | "sent";
  studentId?: string;
}

const ScheduleEmailScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [editingEmail, setEditingEmail] = useState<ScheduledEmail | null>(null);
  const [parentList, setParentList] = useState<ParentReceiver[]>([]);
  const [classList, setClassList] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedEmailType, setSelectedEmailType] = useState<string>("báo cáo điểm");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchClassrooms = async () => {
      try {
        const response = await fetch(`${BASE_URL}classroom/get_classrooms/?teacher_id=${user.uid}`, {
          headers: { Authorization: `Bearer ${user.uid}` }
        });
        const data = await response.json();
        if (response.ok) {
          const formatted = data.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            students: []
          }));
          setClassList(formatted);
        }
      } catch (err) {
        console.error('Lỗi fetch lớp:', err);
      }
    };
    fetchClassrooms();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchParents = async () => {
      try {
        const response = await fetch(`${BASE_URL}contact/get_parents/?teacher_id=${user.uid}`, {
          headers: {
            Authorization: `Bearer ${user.uid}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setParentList(data);
        }
      } catch (err) {
        console.error("Lỗi fetch phụ huynh:", err);
      }
    };
    fetchParents();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchScheduledEmails();
  }, [user?.uid]);

  const fetchStudentsInClass = async (classId: string) => {
    try {
      const response = await fetch(`${BASE_URL}classroom/get_students_by_class/?class_id=${classId}`, {
        headers: { Authorization: `Bearer ${user?.uid}` }
      });
      const data = await response.json();
      if (response.ok) {
        const selected = classList.find(cls => cls.id === classId);
        if (selected) {
          const formattedStudents = await Promise.all(data.map(async (student: any) => {
            const reportCardResponse = await fetch(
              `${BASE_URL}ocr/get_full_report_card/?student_id=${student.id}`,
              {
                headers: { Authorization: `Bearer ${user?.uid}` },
              }
            );
            const reportCardData = await reportCardResponse.json();
            return {
              id: student.id,
              name: student.name,
              email: parentList.find(p => p.studentId === student.id)?.email || "",
              classList: reportCardData.classList || [],
              academicPerformance: reportCardData.academic_perform_year1 || '',
              conduct: reportCardData.conduct || '',
            };
          }));
          setSelectedClass({ ...selected, students: formattedStudents });
          setRecipients([]);
          handleCheckAll(false);
        }
      }
    } catch (err) {
      console.error('Lỗi fetch học sinh:', err);
      Alert.alert("Lỗi", "Không thể lấy danh sách học sinh");
    }
  };

  const fetchScheduledEmails = () => {
    fetch(`${BASE_URL}contact/get_scheduled_emails/?teacher_id=${user?.uid}`, {
      headers: { Authorization: `Bearer ${user?.uid}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted: ScheduledEmail[] = data.map((item: any) => ({
          id: item.id,
          subject: item.subject,
          recipients: item.recipients,
          message: item.message,
          scheduledDate: new Date(item.scheduledDate),
          status: item.status,
          studentId: item.student_id,
        }));
        setEmails(formatted);
      })
      .catch((err) => console.error("Lỗi lấy lịch email:", err));
  };

  const getLatestAcademicData = (student: StudentItem) => {
    if (!student.classList || student.classList.length === 0) {
      return { classNumber: '', gpa: '0', subjectsBelow5: [], academicPerformance: student.academicPerformance || '', conduct: student.conduct || '' };
    }

    const classNumbers = student.classList.map(cls => {
      const match = cls.class.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const highestClassNum = Math.max(...classNumbers);
    const latestClass = student.classList.find(cls => cls.class.includes(highestClassNum.toString()));

    if (!latestClass) {
      return { classNumber: '', gpa: '0', subjectsBelow5: [], academicPerformance: student.academicPerformance || '', conduct: student.conduct || '' };
    }

    const subjects = latestClass.subjects.filter(sub => !['Thể dục', 'The duc'].some(name => sub.name.toLowerCase().includes(name.toLowerCase())));
    const validSubjects = subjects.filter(sub => !sub.name.toLowerCase().includes('dtb'));
    const gpa = validSubjects.reduce((sum, sub) => {
      const score = parseFloat(sub.cn || sub.hk2 || sub.hk1 || '0');
      return sum + (isNaN(score) ? 0 : score);
    }, 0) / (validSubjects.length || 1);

    const subjectsBelow5 = validSubjects
      .filter(sub => {
        const score = parseFloat(sub.cn || sub.hk2 || sub.hk1 || '0');
        return !isNaN(score) && score < 5.0;
      })
      .map(sub => ({ name: sub.name, score: sub.cn || sub.hk2 || sub.hk1 || '0' }));

    return {
      classNumber: latestClass.class,
      gpa: gpa.toFixed(1),
      subjectsBelow5,
      academicPerformance: student.academicPerformance || '',
      conduct: student.conduct || ''
    };
  };

  const generateEmailContent = (student: StudentItem, emailType: string) => {
    const { classNumber, gpa, subjectsBelow5, academicPerformance, conduct } = getLatestAcademicData(student);
    const schoolYear = '2022-2025';
    const teacherName = user?.displayName || 'Giáo viên';
    const semesterName = 'Cả năm';

    switch (emailType) {
      case 'báo cáo điểm':
        return {
          subject: `[Báo cáo học tập] Kết quả học kỳ của học sinh ${student.name} – Lớp ${classNumber}`,
          message: `Kính gửi quý phụ huynh học sinh ${student.name},

Nhà trường xin gửi đến quý phụ huynh bảng tổng hợp kết quả học tập của em trong học kỳ ${semesterName} năm học ${schoolYear}:
🔹 Điểm trung bình học kỳ: ${gpa}
🔹 Xếp loại học lực: ${academicPerformance}
🔹 Xếp loại hạnh kiểm: ${conduct}
🔹 Nhận xét của giáo viên chủ nhiệm:
“Vui lòng liên hệ giáo viên để biết thêm chi tiết.”

Nhà trường mong quý phụ huynh tiếp tục đồng hành và hỗ trợ con em mình trong học tập.

Trân trọng,
${teacherName} – Giáo viên chủ nhiệm lớp ${classNumber}`
        };
      case 'thông báo sự kiện':
        return {
          subject: `[Thông báo] Mời họp phụ huynh lớp ${classNumber} – ${date.toLocaleDateString('vi-VN')}`,
          message: `Kính gửi quý phụ huynh,

Nhà trường xin trân trọng thông báo đến quý vị về buổi họp phụ huynh học sinh lớp ${classNumber} như sau:
🔸 Thời gian: ${date.toLocaleDateString('vi-VN')} lúc ${time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
🔸 Địa điểm: Phòng họp trường
🔸 Nội dung chính:
– Tổng kết kết quả học tập học kỳ vừa qua
– Phổ biến kế hoạch học tập kỳ tiếp theo
– Trao đổi giữa giáo viên và phụ huynh

Sự hiện diện của quý phụ huynh là nguồn động viên to lớn với các em học sinh.

Trân trọng,
${teacherName} – GVCN lớp ${classNumber}`
        };
      case 'cảnh báo học tập':
        return {
          subject: `[Cảnh báo học tập] Học lực chưa đạt của học sinh ${student.name}`,
          message: `Kính gửi quý phụ huynh học sinh ${student.name},

Qua theo dõi kết quả học tập, nhà trường nhận thấy học sinh đang gặp khó khăn trong một số môn học, cụ thể:
📌 Các môn có điểm dưới 5.0:
${subjectsBelow5.length > 0 ? subjectsBelow5.map(sub => `	${sub.name}: ${sub.score}`).join('\n') : 'Không có môn nào dưới 5.0'}

📉 Điểm trung bình hiện tại: ${gpa}
⚠️ Xếp loại học lực: ${academicPerformance}

Giáo viên chủ nhiệm khuyến nghị quý phụ huynh quan tâm, trao đổi thêm với em và phối hợp với nhà trường để có giải pháp cải thiện kịp thời.
Nếu cần hỗ trợ hoặc tư vấn trực tiếp, quý phụ huynh vui lòng liên hệ với giáo viên qua email: ${user?.email || 'email@example.com'} hoặc điện thoại: ${user?.phoneNumber || 'Chưa có số điện thoại'}

Trân trọng,
${teacherName} – Giáo viên chủ nhiệm lớp ${classNumber}`
        };
      default:
        return { subject: '', message: '' };
    }
  };

  const handleCheckboxChange = (email: string, checked: boolean) => {
    setRecipients(prev => {
      const newRecipients = checked ? [...prev, email] : prev.filter(e => e !== email);
      if (newRecipients.length > 0 && selectedClass?.students) {
        const firstStudent = selectedClass.students.find(s => s.email === newRecipients[0]);
        if (firstStudent) {
          const { subject: newSubject, message: newMessage } = generateEmailContent(firstStudent, selectedEmailType);
          setSubject(newSubject);
          setMessage(newMessage);
        }
      } else {
        setSubject("");
        setMessage("");
      }
      return newRecipients;
    });
  };

  const handleCheckAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && selectedClass?.students) {
      const allEmails = selectedClass.students
        .filter((s: any) => s.email)
        .map((s: any) => s.email);
      setRecipients(allEmails);
      if (allEmails.length > 0) {
        const firstStudent = selectedClass.students.find(s => s.email === allEmails[0]);
        if (firstStudent) {
          const { subject: newSubject, message: newMessage } = generateEmailContent(firstStudent, selectedEmailType);
          setSubject(newSubject);
          setMessage(newMessage);
        }
      }
    } else {
      setRecipients([]);
      setSubject("");
      setMessage("");
    }
  };

  const handleScheduleEmail = async () => {
    if (recipients.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một người nhận");
      return;
    }

    const scheduledDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    if (editingEmail && editingEmail.studentId) {
      const student = selectedClass?.students.find(s => s.id === editingEmail.studentId);
      if (!student) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin học sinh");
        return;
      }
      const { subject: defaultSubject, message: defaultMessage } = generateEmailContent(student, selectedEmailType);
      const payload = {
        id: editingEmail.id,
        subject: subject || defaultSubject,
        recipients: recipients.filter(email => email.trim() !== '').join(', '),
        message: message || defaultMessage,
        scheduled_date: scheduledDateTime.toISOString(),
        status: editingEmail.status,
        student_id: editingEmail.studentId,
      };

      try {
        const response = await fetch(`${BASE_URL}contact/update_email_schedule/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.uid}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.error) {
          Alert.alert("Lỗi", data.error);
        } else {
          Alert.alert("Thành công", "Đã cập nhật email");
          fetchScheduledEmails();
          setEditingEmail(null);
          resetForm();
        }
      } catch (err) {
        console.error("Lỗi update email:", err);
        Alert.alert("Lỗi", "Không kết nối được máy chủ");
      }
    } else {
      try {
        for (const email of recipients) {
          const student = selectedClass?.students.find(s => s.email === email);
          if (!student) continue;

          const { subject: generatedSubject, message: generatedMessage } = generateEmailContent(student, selectedEmailType);
          const payload = {
            subject: generatedSubject,
            recipient: email,
            message: generatedMessage,
            scheduled_time: scheduledDateTime.toISOString(),
            teacher_id: user?.uid,
            student_id: student.id,
          };

          const response = await fetch(`${BASE_URL}contact/schedule_email/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.uid}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          if (data.error) {
            Alert.alert("Lỗi", `Không thể lên lịch email cho ${student.name}: ${data.error}`);
          } else {
            const newEmail: ScheduledEmail = {
              id: data.email_id || Date.now().toString(),
              subject: generatedSubject,
              recipients: email,
              message: generatedMessage,
              scheduledDate: scheduledDateTime,
              status: "pending",
              studentId: student.id,
            };
            setEmails(prev => [...prev, newEmail]);
          }
        }
        Alert.alert("Thành công", "Đã lên lịch gửi email cho các học sinh được chọn");
        resetForm();
      } catch (err) {
        console.error("Lỗi gửi API:", err);
        Alert.alert("Lỗi", "Không kết nối được máy chủ");
      }
    }
  };

  const handleEditEmail = (email: ScheduledEmail) => {
    if (email.status === "sent") {
      Alert.alert("Thông báo", "Không thể chỉnh sửa email đã gửi");
      return;
    }

    setEditingEmail(email);
    setSubject(email.subject);
    setRecipients(email.recipients.split(', ').filter(email => email));
    setMessage(email.message);
    setDate(email.scheduledDate);
    setTime(email.scheduledDate);
    setSelectedEmailType(determineEmailType(email.subject));
  };

  const determineEmailType = (subject: string): string => {
    if (subject.includes('Báo cáo học tập')) return 'báo cáo điểm';
    if (subject.includes('Thông báo')) return 'thông báo sự kiện';
    if (subject.includes('Cảnh báo học tập')) return 'cảnh báo học tập';
    return 'báo cáo điểm';
  };

  const handleDeleteEmail = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa email này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          fetch(`${BASE_URL}contact/delete_email_schedule/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.uid}`,
            },
            body: JSON.stringify({ id }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                Alert.alert("Lỗi", data.error);
              } else {
                Alert.alert("Thành công", "Đã xóa email");
                setEmails((prev) => prev.filter((email) => email.id !== id));
                if (editingEmail?.id === id) {
                  setEditingEmail(null);
                  resetForm();
                }
              }
            })
            .catch((err) => {
              console.error("Lỗi xóa email:", err);
              Alert.alert("Lỗi", "Không kết nối được máy chủ");
            });
        },
      },
    ]);
  };

  const handleSendNow = async () => {
    if (recipients.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một người nhận");
      return;
    }

    try {
      for (const email of recipients) {
        const student = selectedClass?.students.find(s => s.email === email);
        if (!student) continue;

        const { subject: generatedSubject, message: generatedMessage } = generateEmailContent(student, selectedEmailType);
        const payload = {
          subject: generatedSubject,
          recipient: email,
          message: generatedMessage,
          teacher_id: user?.uid,
          student_id: student.id,
        };

        const response = await fetch(`${BASE_URL}contact/send_email_now/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.uid}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.error) {
          Alert.alert("Lỗi", `Không thể gửi email cho ${student.name}: ${data.error}`);
        } else {
          const newEmail: ScheduledEmail = {
            id: Date.now().toString(),
            subject: generatedSubject,
            recipients: email,
            message: generatedMessage,
            scheduledDate: new Date(),
            status: "sent",
            studentId: student.id,
          };
          setEmails(prev => [...prev, newEmail]);
        }
      }
      Alert.alert("Thành công", "Đã gửi email ngay cho các học sinh được chọn");
      resetForm();
    } catch (err) {
      console.error("Lỗi gửi email ngay:", err);
      Alert.alert("Lỗi", "Không kết nối được máy chủ");
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setShowDatePicker(false);
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }
    if (selectedTime) {
      setShowTimePicker(false);
      setTime(selectedTime);
    }
  };

  const resetForm = () => {
    setSubject("");
    setRecipients([]);
    setMessage("");
    setDate(new Date());
    setTime(new Date());
    setEditingEmail(null);
    setSelectedEmailType("báo cáo điểm");
    handleCheckAll(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingEmail ? "Chỉnh sửa email" : "Lập lịch gửi email"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView>
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <FontAwesome name="calendar" size={20} color="#1E88E5" />
              <Text style={styles.dateText}>Ngày: {date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <FontAwesome name="clock-o" size={20} color="#1E88E5" />
              <Text style={styles.dateText}>Giờ: {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Chọn lớp học</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedClass?.id}
                onValueChange={(itemValue) => {
                  const selected = classList.find(cls => cls.id === itemValue);
                  setSelectedClass(selected || null);
                  if (selected) fetchStudentsInClass(selected.id);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Chọn lớp..." value={null} />
                {classList.map((cls) => (
                  <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Danh sách học sinh</Text>
            <View style={styles.studentListContainer}>
              <View style={styles.headerRow}>
                <Checkbox
                  value={selectAll}
                  onValueChange={handleCheckAll}
                  color={selectAll ? "#1E88E5" : undefined}
                  style={styles.checkbox}
                />
                <Text style={[styles.headerCell, { flex: 2 }]}>Tên HS</Text>
                <Text style={[styles.headerCell, { flex: 3 }]}>Email PHHS</Text>
              </View>
              <FlatList
                data={selectedClass?.students || []}
                keyExtractor={(item) => item.id}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                  <View style={styles.studentRow}>
                    <Checkbox
                      value={recipients.includes(item.email)}
                      onValueChange={(newValue) => handleCheckboxChange(item.email, newValue)}
                      color={recipients.includes(item.email) ? "#1E88E5" : undefined}
                      style={styles.checkbox}
                    />
                    <Text style={[styles.studentCell, { flex: 2 }]}>{item.name}</Text>
                    <Text style={[styles.studentCell, { flex: 3 }]}>{item.email}</Text>
                  </View>
                )}
                contentContainerStyle={styles.studentListContent}
              />
            </View>

            <Text style={styles.label}>Loại email</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedEmailType}
                onValueChange={(itemValue) => {
                  setSelectedEmailType(itemValue);
                  if (selectedClass?.students && recipients.length > 0) {
                    const firstStudent = selectedClass.students.find(s => s.email === recipients[0]);
                    if (firstStudent) {
                      const { subject: newSubject, message: newMessage } = generateEmailContent(firstStudent, itemValue);
                      setSubject(newSubject);
                      setMessage(newMessage);
                    }
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="Báo cáo điểm" value="báo cáo điểm" />
                <Picker.Item label="Thông báo sự kiện" value="thông báo sự kiện" />
                <Picker.Item label="Cảnh báo học tập" value="cảnh báo học tập" />
              </Picker>
            </View>

            <Text style={styles.label}>Tiêu đề (Mẫu cho học sinh đầu tiên)</Text>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề sẽ được tùy chỉnh cho từng học sinh"
              value={subject}
              onChangeText={setSubject}
              editable={true}
            />

            <Text style={styles.label}>Nội dung (Mẫu cho học sinh đầu tiên)</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Nội dung sẽ được tùy chỉnh cho từng học sinh"
              value={message}
              onChangeText={setMessage}
              multiline
              editable={true}
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.sendNowButton]}
                onPress={handleSendNow}
              >
                <Text style={styles.buttonText}>Gửi ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleScheduleEmail}
              >
                <Text style={styles.buttonText}>
                  {editingEmail ? "Cập nhật" : "Lưu lịch"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={emails}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.emailItem}>
                <View style={styles.emailHeader}>
                  <Text style={styles.emailSubject}>{item.subject}</Text>
                  <View style={styles.emailActions}>
                    {item.status === "pending" && (
                      <>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditEmail(item)}
                        >
                          <FontAwesome name="edit" size={16} color="#FFA500" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteEmail(item.id)}
                        >
                          <FontAwesome name="trash" size={16} color="#D92D20" />
                        </TouchableOpacity>
                      </>
                    )}
                    <FontAwesome
                      name={item.status === "sent" ? "check-circle" : "clock-o"}
                      size={20}
                      color={item.status === "sent" ? "#38A169" : "#1E88E5"}
                    />
                  </View>
                </View>
                <Text style={styles.emailDetail}>
                  Người nhận: {item.recipients}
                </Text>
                <Text style={styles.emailDetail}>
                  Thời gian: {formatDate(item.scheduledDate)}
                </Text>
                <Text
                  style={[
                    styles.emailStatus,
                    item.status === "sent"
                      ? styles.sentStatus
                      : styles.pendingStatus,
                  ]}
                >
                  {item.status === "sent" ? "Đã gửi" : "Đang chờ"}
                </Text>
                {item.status === "pending" && (
                  <TouchableOpacity
                    style={styles.sendNowButton}
                    onPress={() => {
                      fetch(`${BASE_URL}contact/send_email_now/`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${user?.uid}`,
                        },
                        body: JSON.stringify({
                          subject: item.subject,
                          recipient: item.recipients,
                          message: item.message,
                          student_id: item.studentId,
                        }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.error) {
                            Alert.alert("Lỗi", data.error);
                          } else {
                            Alert.alert("Thành công", "Đã gửi email ngay");
                            setEmails((prev) =>
                              prev.map((e) =>
                                e.id === item.id ? { ...e, status: "sent" } : e
                              )
                            );
                          }
                        })
                        .catch((err) => {
                          console.error("Lỗi gửi email ngay:", err);
                          Alert.alert("Lỗi", "Không kết nối được máy chủ");
                        });
                    }}
                  >
                    <Text style={styles.sendNowText}>Gửi ngay</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <Text style={styles.listTitle}>
                {editingEmail ? "Danh sách email" : "Lịch gửi email"}
              </Text>
            }
          />

          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          {Platform.OS === "android" && showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
    backgroundColor: "white",
    margin: 15,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
  },
  dateText: {
    marginLeft: 10,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 55,
    color: "#333",
  },
  studentListContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    marginBottom: 15,
  },
  studentListContent: {
    paddingVertical: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "#F0F0F0",
  },
  headerCell: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  checkbox: {
    marginRight: 10,
  },
  studentCell: {
    fontSize: 14,
    color: "#333",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  sendNowButton: {
    backgroundColor: "#38A169",
  },
  submitButton: {
    backgroundColor: "#1E88E5",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  emailItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  emailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  emailActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginRight: 10,
  },
  emailDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  emailStatus: {
    marginTop: 5,
    fontWeight: "bold",
  },
  pendingStatus: {
    color: "#1E88E5",
  },
  sentStatus: {
    color: "#38A169",
  },
  sendNowText: {
    color: "white",
    fontSize: 12,
  },
});

export default ScheduleEmailScreen;
