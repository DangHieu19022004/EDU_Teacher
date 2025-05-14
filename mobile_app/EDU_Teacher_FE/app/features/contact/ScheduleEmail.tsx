import React, { useState, useEffect, useCallback } from "react";
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
import Checkbox from "expo-checkbox"
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

interface StudentItem {
  id: string;
  name: string;
  email: string;
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
          const formattedStudents = data.map((student: any) => {
            const matchedParent = parentList.find(p => p.studentId === student.id);
            return {
              id: student.id,
              name: student.name,
              email: matchedParent?.email || "",
            };
          });
          setSelectedClass({ ...selected, students: formattedStudents });
          // Reset recipients and checkAll when class changes
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
        }));
        setEmails(formatted);
      })
      .catch((err) => console.error("Lỗi lấy lịch email:", err));
  };

  const handleCheckboxChange = (email: string, checked: boolean) => {
    setRecipients(prev => {
      if (checked) {
        return [...prev, email];
      } else {
        return prev.filter(e => e !== email);
      }
    });
  };

  const handleCheckAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && selectedClass?.students) {
      const allEmails = selectedClass.students.map((s: any) => s.email);
      setRecipients(allEmails);
    } else {
      setRecipients([]);
    }
  };

  const handleScheduleEmail = () => {
    if (!subject || recipients.length === 0 || !message) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const scheduledDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    if (editingEmail) {
      const payload = {
        id: editingEmail.id,
        subject,
        recipients: recipients.filter(email => email.trim() !== '').join(', '),
        message,
        scheduled_date: scheduledDateTime.toISOString(),
        status: editingEmail.status,
      };

      fetch(`${BASE_URL}contact/update_email_schedule/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.uid}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            Alert.alert("Lỗi", data.error);
          } else {
            Alert.alert("Thành công", "Đã cập nhật email");
            fetchScheduledEmails();
            setEditingEmail(null);
            resetForm();
          }
        })
        .catch((err) => {
          console.error("Lỗi update email:", err);
          Alert.alert("Lỗi", "Không kết nối được máy chủ");
        });
    } else {
      const payload = {
        subject,
        recipient: recipients.join(', '),
        message,
        scheduled_time: scheduledDateTime.toISOString(),
        teacher_id: user?.uid,
      };

      fetch(`${BASE_URL}contact/schedule_email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.uid}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            Alert.alert("Lỗi", data.error);
          } else {
            const newEmail: ScheduledEmail = {
              id: data.email_id || Date.now().toString(),
              subject,
              recipients: recipients.join(', '),
              message,
              scheduledDate: scheduledDateTime,
              status: "pending",
            };
            setEmails([...emails, newEmail]);
            Alert.alert("Thành công", "Đã lên lịch gửi email");
            resetForm();
          }
        })
        .catch((err) => {
          console.error("Lỗi gửi API:", err);
          Alert.alert("Lỗi", "Không kết nối được máy chủ");
        });
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

  const handleSendNow = () => {
    if (!subject || recipients.length === 0 || !message) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const payload = {
      subject,
      recipient: recipients.join(', '),
      message,
      teacher_id: user?.uid,
    };

    fetch(`${BASE_URL}contact/send_email_now/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.uid}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          Alert.alert("Lỗi", data.error);
        } else {
          Alert.alert("Thành công", "Đã gửi email ngay");
          const newEmail: ScheduledEmail = {
            id: Date.now().toString(),
            subject,
            recipients: recipients.join(', '),
            message,
            scheduledDate: new Date(),
            status: "sent",
          };
          setEmails([...emails, newEmail]);
          resetForm();
        }
      })
      .catch((err) => {
        console.error("Lỗi gửi email ngay:", err);
        Alert.alert("Lỗi", "Không kết nối được máy chủ");
      });
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
          {/* Date and Time Picker */}
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

          {/* Chọn lớp học */}
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

          {/* Danh sách học sinh */}
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

          {/* Chọn loại email */}
          <Text style={styles.label}>Loại email</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedEmailType}
              onValueChange={(itemValue) => setSelectedEmailType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Báo cáo điểm" value="báo cáo điểm" />
              <Picker.Item label="Thông báo lịch thi" value="thông báo lịch thi" />
              <Picker.Item label="Thông tin sự kiện" value="thông tin sự kiện" />
              <Picker.Item label="Tin nhắn riêng" value="tin nhắn riêng" />
              <Picker.Item label="Khác" value="khác" />
            </Picker>
          </View>

          {/* Tiêu đề email */}
          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề email"
            value={subject}
            onChangeText={setSubject}
          />

          {/* Nội dung email */}
          <Text style={styles.label}>Nội dung</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Nhập nội dung email"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          {/* Nút hành động */}
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
