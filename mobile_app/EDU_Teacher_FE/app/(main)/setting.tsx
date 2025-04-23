import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Image, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginManager } from 'react-native-fbsdk-next';
import auth from "@react-native-firebase/auth";

const SettingsScreen: React.FC = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const router = useRouter();

  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);

  const handleSignOut = async () => {
    try {
      const fbUser = await AsyncStorage.getItem("fb_uid");
      const accessToken = await AsyncStorage.getItem("access_token");

      if (fbUser) {
        console.log("Logging out from Facebook...");
        LoginManager.logOut();
        await AsyncStorage.removeItem("fb_uid");
      } else if (accessToken) {
        console.log("Logging out from social login (Google/Facebook)...");
        await AsyncStorage.removeItem("access_token");
      } else {
        // Mặc định: đăng xuất tài khoản email/password
        console.log("Logging out from email/password...");
      }

      // Firebase luôn phải signOut để xóa thông tin user
      await auth().signOut();

      // Chuyển về màn hình login
      router.replace("../(auth)");
    } catch (error) {
      console.log("Sign-Out Error:", error);
      Alert.alert("Logout Failed", error.message || "Có lỗi xảy ra khi đăng xuất.");
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
      </View>

      <Text style={styles.title}>Cài đặt</Text>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.optionRow}>
        <FontAwesome name="bell" size={20} color="#2F54EB" style={styles.icon} />
        <Text style={styles.optionText}>Thông báo</Text>
        <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} style={styles.switch} />
      </View>
      <Text style={styles.sectionTitle}>Chung</Text>
      {[{ icon: 'globe', text: 'Ngôn ngữ' }, { icon: 'info-circle', text: 'Thông tin ứng dụng' }].map((item, i) => (
        <TouchableOpacity key={i} style={styles.optionRowGeneral}>
          <FontAwesome name={item.icon as any} size={20} color="#2F54EB" style={styles.icon} />
          <Text style={styles.optionText}>{item.text}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.sectionTitle}>Khác</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <FontAwesome name="sign-out" size={20} color="white"/>
        <Text style={styles.logoutText}> Đăng xuất</Text>
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 20 },
  title: { fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
  logoContainer: { alignItems: 'center', marginVertical: 20 },
  logo: { width: 300, height: 150 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 15, backgroundColor: 'white', marginBottom: 10, justifyContent: 'space-between', borderWidth: 1, borderColor: '#A0A0A0' },
  optionRowGeneral: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingVertical: 20 , borderRadius: 15, backgroundColor: 'white', marginBottom: 10, justifyContent: 'space-between', borderWidth: 1, borderColor: '#A0A0A0' },
  icon: { marginRight: 10, color: '#1E88E5' },
  optionText: { fontSize: 16, flex: 1 },
  switch: { alignSelf: 'flex-end' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#D32F2F', padding: 15, borderRadius: 15 },
  logoutText: { fontSize: 16, color: 'white' },
  statusBar: {height: 30, backgroundColor: 'white'},
});

export default SettingsScreen;
