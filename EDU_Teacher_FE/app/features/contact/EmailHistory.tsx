import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from "@/constants/Config";
import { useUser } from "../../contexts/UserContext";
import { useEffect } from "react";

interface ScheduledEmail {
  id: string;
  subject: string;
  recipients: string;
  message: string;
  scheduledDate: Date;
  status: "pending" | "sent";
}

const EmailHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [emails, setEmails] = React.useState<ScheduledEmail[]>([]);

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
        <Text style={styles.headerTitle}>Lịch sử gửi email</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={emails}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.emailItem}>
            <View style={styles.emailHeader}>
              <Text style={styles.emailSubject}>{item.subject}</Text>
              <FontAwesome
                name={item.status === 'sent' ? 'check-circle' : 'times-circle'}
                size={20}
                color={item.status === 'sent' ? '#38A169' : '#D92D20'}
              />
            </View>
            <Text style={styles.emailRecipients}>{item.recipients}</Text>
            <Text style={styles.emailDate}>{formatDate(item.scheduledDate)}</Text>
            {item.status === 'pending' && (
              <TouchableOpacity style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Thử gửi lại</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
    padding: 15,
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
    alignItems: 'center',
    marginBottom: 5,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  emailRecipients: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  emailDate: {
    fontSize: 12,
    color: '#888',
  },
  retryButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#E53E3E',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default EmailHistoryScreen;
