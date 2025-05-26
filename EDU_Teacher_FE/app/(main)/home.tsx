import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from "../contexts/UserContext";
import MainHeader from '@/components/MainHeader';
import { LinearGradient } from "expo-linear-gradient";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  console.log('User:', user);
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
    <ImageBackground
      source={require('../../assets/images/logo.png')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      {/* Header */}
      <MainHeader title="Trang chủ" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>

        {/* Main feature Section */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>Quản lý học bạ</Text>
          <View style={styles.featureRow}>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanPress} >
              <LinearGradient colors={["#2138AA", "#32ADE6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainGradient}>
                <FontAwesome name="camera" size={90} color="white" />
                <Text style={styles.scanButtonText}>Chụp ảnh học bạ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.sideButtons}>
              <TouchableOpacity
                style={styles.dataButton}
                onPress={() => router.push('../features/data_manager/ClassListScreen')}
              >
                <LinearGradient colors={["#32ADE6", "#1ABC9C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subGradient}>
                  <FontAwesome name="database" size={30} color="white" />
                  <Text style={styles.sideButtonText}>Kho dữ liệu</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statisticsButton}
                onPress={handleStatisticsPress}
              >
                <LinearGradient colors={["#32ADE6", "#1ABC9C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subGradient}>
                  <FontAwesome name="bar-chart" size={30} color="white" />
                  <Text style={styles.sideButtonText}>Thống kê</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Sổ liên lạc điện tử</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => router.push('../features/contact/ScheduleEmail')}
            >
              <LinearGradient colors={["#2138AA", "#32ADE6"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.mainGradient}>
                <FontAwesome name="calendar" size={30} color="white" />
                <Text style={styles.contactButtonText}>Lập lịch gửi email</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push('../features/contact/AddContact')}
            >
              <LinearGradient colors={["#32ADE6", "#1ABC9C"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.subGradient}>
                <FontAwesome name="user-plus" size={30} color="white" />
                <Text style={styles.contactButtonText}>Thêm liên hệ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailHistoryButton}
              onPress={() => router.push('../features/contact/EmailHistory')}
            >
              <LinearGradient colors={["#32ADE6", "#1ABC9C"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.subGradient}>
                <FontAwesome name="envelope" size={30} color="white" />
                <Text style={styles.contactButtonText}>Lịch sử gửi email</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.empty}></View>

      </ScrollView>

      {/* Chatbot Button */}
      <TouchableOpacity style={styles.chatbotButton} onPress={handleChatbotPress}>
        <Image source={require('../../assets/images/chatbot-logo.png')} />
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8'
  },
  backgroundImage: {
    opacity: 0.5,
    resizeMode: 'contain',
  },
  header: {
    backgroundColor: '#0066CC',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureSection: {
    backgroundColor: '#E8E8E8',
    marginRight: 40,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    marginTop: 20,
    paddingVertical: 20,
    opacity: 0.8,
  },
  sectionTitle: { fontSize: 25, fontWeight: 'bold', textAlign: 'center' },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  scanButton: {
    overflow: "hidden",
    backgroundColor: '#2435B0',
    // padding: 20,
    borderRadius: 20,
    width: '56%',
    alignItems: 'center',
  },
  scanButtonText: { color: 'white', fontSize: 14, marginTop: 5 },
  sideButtons: { width: '40%' },
  dataButton: {
    backgroundColor: '#3099DC',
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
    opacity: 0.8
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  scheduleButton: {
    backgroundColor: '#2435B0',
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactButton: {
    backgroundColor: '#3099DC',
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  emailHistoryButton: {
    backgroundColor: '#3099DC',
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
    backgroundColor: '#3099DC',
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  empty: {
    height: 100,
  },
  mainGradient: {
    width: '100%',
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 20,
  },
  subGradient: {
    width: '100%',
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
});

export default HomeScreen;
