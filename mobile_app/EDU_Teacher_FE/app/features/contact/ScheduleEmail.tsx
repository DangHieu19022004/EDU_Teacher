import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ScheduledEmail {
  id: string;
  subject: string;
  recipients: string;
  message: string;
  scheduledDate: Date;
  status: 'pending' | 'sent';
}

const ScheduleEmailScreen: React.FC = () => {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [emails, setEmails] = useState<ScheduledEmail[]>([
    {
      id: '1',
      subject: 'Thông báo họp phụ huynh',
      recipients: 'a.nguyen@example.com, b.tran@example.com',
      message: 'Kính mời quý phụ huynh tham dự buổi họp...',
      scheduledDate: new Date(2023, 5, 15, 14, 0),
      status: 'pending',
    },
    {
      id: '2',
      subject: 'Kết quả học tập học kỳ I',
      recipients: 'parents@example.com',
      message: 'Gửi quý phụ huynh kết quả học tập...',
      scheduledDate: new Date(2023, 5, 20, 9, 0),
      status: 'sent',
    },
  ]);
  const [editingEmail, setEditingEmail] = useState<ScheduledEmail | null>(null);

  const handleScheduleEmail = () => {
    if (!subject || !recipients || !message) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (editingEmail) {
      // Chỉnh sửa email đang chờ
      const updatedEmails = emails.map(email =>
        email.id === editingEmail.id
          ? {
              ...email,
              subject,
              recipients,
              message,
              scheduledDate: date
            }
          : email
      );
      setEmails(updatedEmails);
      setEditingEmail(null);
      Alert.alert('Thành công', 'Đã cập nhật email');
    } else {
      // Thêm email mới
      const newEmail: ScheduledEmail = {
        id: Date.now().toString(),
        subject,
        recipients,
        message,
        scheduledDate: date,
        status: 'pending',
      };
      setEmails([...emails, newEmail]);
      Alert.alert('Thành công', 'Đã lên lịch gửi email');
    }

    resetForm();
  };

  const handleEditEmail = (email: ScheduledEmail) => {
    if (email.status === 'sent') {
      Alert.alert('Thông báo', 'Không thể chỉnh sửa email đã gửi');
      return;
    }

    setEditingEmail(email);
    setSubject(email.subject);
    setRecipients(email.recipients);
    setMessage(email.message);
    setDate(email.scheduledDate);
  };

  const handleDeleteEmail = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa email này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setEmails(emails.filter(email => email.id !== id));
            if (editingEmail?.id === id) {
              setEditingEmail(null);
              resetForm();
            }
          }
        }
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const resetForm = () => {
    setSubject('');
    setRecipients('');
    setMessage('');
    setDate(new Date());
    setEditingEmail(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingEmail ? 'Chỉnh sửa email' : 'Lập lịch gửi email'}
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
        <TextInput
          style={styles.input}
          placeholder="Người nhận (cách nhau bởi dấu phẩy)"
          value={recipients}
          onChangeText={setRecipients}
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
          <Text style={styles.dateText}>
            {formatDate(date)}
          </Text>
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
              {editingEmail ? 'Cập nhật' : 'Lên lịch gửi'}
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
                {item.status === 'pending' && (
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
                  name={item.status === 'sent' ? 'check-circle' : 'clock-o'}
                  size={20}
                  color={item.status === 'sent' ? '#38A169' : '#1E88E5'}
                />
              </View>
            </View>
            <Text style={styles.emailDetail}>Người nhận: {item.recipients}</Text>
            <Text style={styles.emailDetail}>Thời gian: {formatDate(item.scheduledDate)}</Text>
            <Text style={[
              styles.emailStatus,
              item.status === 'sent' ? styles.sentStatus : styles.pendingStatus
            ]}>
              {item.status === 'sent' ? 'Đã gửi' : 'Đang chờ'}
            </Text>
            {item.status === 'pending' && (
              <TouchableOpacity
                style={styles.sendNowButton}
                onPress={() => Alert.alert('Thông báo', 'Gửi ngay email này')}
              >
                <Text style={styles.sendNowText}>Gửi ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.listTitle}>
            {editingEmail ? 'Danh sách email' : 'Lịch gửi email'}
          </Text>
        }
      />

      {showDatePicker && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
            <TouchableOpacity
              style={styles.datePickerClose}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.datePickerCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
  },
  dateText: {
    marginLeft: 10,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#1E88E5',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emailItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  emailActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginRight: 10,
  },
  emailDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  emailStatus: {
    marginTop: 5,
    fontWeight: 'bold',
  },
  pendingStatus: {
    color: '#1E88E5',
  },
  sentStatus: {
    color: '#38A169',
  },
  sendNowButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#38A169',
    borderRadius: 5,
  },
  sendNowText: {
    color: 'white',
    fontSize: 12,
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerClose: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  datePickerCloseText: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
});

export default ScheduleEmailScreen;
