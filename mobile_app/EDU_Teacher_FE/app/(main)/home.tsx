import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from "../contexts/UserContext";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();

  const handleScanPress = () => {
    router.push('../features/scanning/photoCapture');
  };

  const handleChatbotPress = () => {
    router.push('../features/chat_bot/ChatbotScreen');
  };

  const handleStatisticsPress = () => {
    router.push('../features/statistics/StatisticsScreen');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('../navigation/menu')}>
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trang chủ</Text>
        <TouchableOpacity>
          <Image source={{ uri: user?.photoURL }} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>

        {/* Main feature Section */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>Quản lý học bạ</Text>
          <View style={styles.featureRow}>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
              <FontAwesome name="camera" size={90} color="white" />
              <Text style={styles.scanButtonText}>Chụp ảnh học bạ</Text>
            </TouchableOpacity>

            <View style={styles.sideButtons}>
              <TouchableOpacity
                style={styles.dataButton}
                onPress={() => router.push('../features/data_manager/ClassListScreen')}
              >
                <FontAwesome name="database" size={30} color="white" />
                <Text style={styles.sideButtonText}>Kho dữ liệu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statisticsButton}
                onPress={handleStatisticsPress}
              >
                <FontAwesome name="bar-chart" size={30} color="white" />
                <Text style={styles.sideButtonText}>Thống kê</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Sổ liên lạc điện tử</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push('../features/contact/AddContact')}
            >
              <FontAwesome name="user-plus" size={30} color="white" />
              <Text style={styles.contactButtonText}>Thêm liên hệ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => router.push('../features/contact/ScheduleEmail')}
            >
              <FontAwesome name="calendar" size={30} color="white" />
              <Text style={styles.contactButtonText}>Lập lịch gửi email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailHistoryButton}
              onPress={() => router.push('../features/contact/EmailHistory')}
            >
              <FontAwesome name="envelope" size={30} color="white" />
              <Text style={styles.contactButtonText}>Lịch sử gửi email</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Chatbot Button */}
      <TouchableOpacity style={styles.chatbotButton} onPress={handleChatbotPress}>
        <Image source={require('../../assets/images/chatbot-logo.png')} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 25, fontWeight: 'bold' },
  logo: { width: 30, height: 30, borderRadius: 15 },
  featureSection: {
    backgroundColor: '#E8E8E8',
    marginRight: 40,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    marginTop: 120,
    paddingVertical: 20,
  },
  sectionTitle: { fontSize: 25, fontWeight: 'bold', textAlign: 'center' },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  scanButton: {
    backgroundColor: '#1E88E5',
    padding: 20,
    borderRadius: 20,
    width: '56%',
    alignItems: 'center',
  },
  scanButtonText: { color: 'white', fontSize: 14, marginTop: 5 },
  sideButtons: { width: '40%' },
  dataButton: {
    backgroundColor: '#D53F8C',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },

  sideButtonText: { color: 'white', fontSize: 12, marginTop: 5 },
  chatbotButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 90,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  contactSection: {
    backgroundColor: '#E8E8E8',
    marginLeft: 40,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
    padding: 15,
    marginTop: 20,
    paddingVertical: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  contactButton: {
    backgroundColor: '#3182CE',
    padding: 15,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleButton: {
    backgroundColor: '#805AD5',
    padding: 15,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  emailHistoryButton: {
    backgroundColor: '#DD6B20',
    padding: 15,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingTop: 20,
  },
  statisticsButton: {
    backgroundColor: '#38A169',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
});

export default HomeScreen;
