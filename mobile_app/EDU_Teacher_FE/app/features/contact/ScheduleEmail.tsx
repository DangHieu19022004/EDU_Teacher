import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect } from "react";
import { BASE_URL } from "@/constants/Config";
import { useUser } from "../../contexts/UserContext";
import { Platform } from "react-native";

interface ParentReceiver {
  id: string;
  parentName: string;
  email: string;
  studentName: string;
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
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [editingEmail, setEditingEmail] = useState<ScheduledEmail | null>(null);

  const [parentList, setParentList] = useState<ParentReceiver[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`${BASE_URL}contact/get_parents/?teacher_id=${user.uid}`, {
      headers: { Authorization: `Bearer ${user.uid}` },
    })
      .then((res) => res.json())
      .then((data) => setParentList(data))
      .catch((err) => console.error("Lỗi lấy danh sách phụ huynh:", err));
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    fetchScheduledEmails();
  }, []);
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

  const handleScheduleEmail = () => {
    if (!subject || !recipients || !message) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      console.log("Subject:", subject);
      console.log("Recipients:", recipients);
      console.log("Message:", message);
      console.log("Date:", date);
      console.log("Time:", time);
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
        recipients,
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
            fetchScheduledEmails(); // Load lại danh sách
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
        recipient: recipients,
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
              id: data.email_id || Date.now().toString(), // _id trả về từ backend
              subject,
              recipients,
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
    fetchScheduledEmails();
  };

  const handleEditEmail = (email: ScheduledEmail) => {
    if (email.status === "sent") {
      Alert.alert("Thông báo", "Không thể chỉnh sửa email đã gửi");
      return;
    }

    setEditingEmail(email);
    setSubject(email.subject);
    setRecipients(email.recipients);
    setMessage(email.message);
    setDate(email.scheduledDate);
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
                Alert.alert("Thành công", "Đã xoá email");
                setEmails((prev) => prev.filter((email) => email.id !== id));
                if (editingEmail?.id === id) {
                  setEditingEmail(null);
                  resetForm();
                }
              }
            })
            .catch((err) => {
              console.error("Lỗi xoá email:", err);
              Alert.alert("Lỗi kết nối máy chủ");
            });
        },
      },
    ]);
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
    setRecipients("");
    setMessage("");
    setDate(new Date());
    setEditingEmail(null);
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

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tiêu đề"
          value={subject}
          onChangeText={setSubject}
        />
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Người nhận</Text>
        <FlatList
          horizontal
          data={parentList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: recipients === item.email ? "#1E88E5" : "#EEE",
                borderRadius: 8,
                marginRight: 10,
              }}
              onPress={() => setRecipients(item.email)}
            >
              <Text
                style={{ color: recipients === item.email ? "#FFF" : "#000" }}
              >
                {item.parentName} ({item.studentName})
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ marginBottom: 10 }}
        />

        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Nội dung"
          value={message}
          onChangeText={setMessage}
          multiline
        />

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
          <Text style={styles.dateText}>Giờ: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>


        <View style={styles.buttonGroup}>
          {editingEmail && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton]}
            onPress={handleScheduleEmail}
          >
            <Text style={styles.buttonText}>
              {editingEmail ? "Cập nhật" : "Lên lịch gửi"}
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
                      onPress={() => {
                        console.log("Xóa email:", item.id);
                        handleDeleteEmail(item.id);
                      }}
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
                      Alert.alert("Lỗi kết nối máy chủ");
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
    </View>
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
  sendNowButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#38A169",
    borderRadius: 5,
  },
  sendNowText: {
    color: "white",
    fontSize: 12,
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  datePickerClose: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  datePickerCloseText: {
    color: "#1E88E5",
    fontWeight: "bold",
  },
});

export default ScheduleEmailScreen;
