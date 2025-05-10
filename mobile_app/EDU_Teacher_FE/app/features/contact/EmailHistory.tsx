import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface EmailHistory {
  id: string;
  subject: string;
  recipients: string;
  date: string;
  status: 'success' | 'failed';
}

const EmailHistoryScreen: React.FC = () => {
  const router = useRouter();

  const emailHistory: EmailHistory[] = [
    {
      id: '1',
      subject: 'Thông báo họp phụ huynh',
      recipients: 'a.nguyen@example.com, b.tran@example.com',
      date: '15/06/2023 14:05',
      status: 'success',
    },
    {
      id: '2',
      subject: 'Kết quả học tập học kỳ I',
      recipients: 'parents@example.com',
      date: '20/06/2023 09:02',
      status: 'success',
    },
    {
      id: '3',
      subject: 'Thông báo nghỉ học',
      recipients: 'invalid@example.com',
      date: '22/06/2023 08:30',
      status: 'failed',
    },
  ];

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
        data={emailHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.emailItem}>
            <View style={styles.emailHeader}>
              <Text style={styles.emailSubject}>{item.subject}</Text>
              <FontAwesome
                name={item.status === 'success' ? 'check-circle' : 'times-circle'}
                size={20}
                color={item.status === 'success' ? '#38A169' : '#D92D20'}
              />
            </View>
            <Text style={styles.emailRecipients}>{item.recipients}</Text>
            <Text style={styles.emailDate}>{item.date}</Text>
            {item.status === 'failed' && (
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
