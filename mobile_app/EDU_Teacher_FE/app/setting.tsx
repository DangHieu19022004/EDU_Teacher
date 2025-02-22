import React from 'react';
import { View, Text, TouchableOpacity, Switch, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Cài đặt</Text>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('./assets/Edu.png')} style={styles.logo} resizeMode="contain" />
      </View>
      
      {/* Notification Toggle */}
      <View style={styles.optionContainer}>
        <View style={styles.optionRow}>
          <FontAwesome name="bell" size={20} color="#2F54EB" style={styles.icon} />
          <Text style={styles.optionText}>Thông báo</Text>
        </View>
        <Switch value={true} />
      </View>
      
      {/* General Settings */}
      <Text style={styles.sectionTitle}>Chung</Text>
      <TouchableOpacity style={styles.optionContainer}>
        <FontAwesome name="globe" size={20} color="#2F54EB" style={styles.icon} />
        <Text style={styles.optionText}>Ngôn ngữ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionContainer}>
        <FontAwesome name="info-circle" size={20} color="#2F54EB" style={styles.icon} />
        <Text style={styles.optionText}>Thông tin ứng dụng</Text>
      </TouchableOpacity>
      
      {/* Logout Button */}
      <Text style={styles.sectionTitle}>Khác</Text>
      <TouchableOpacity style={styles.logoutButton}>
        <FontAwesome name="sign-out" size={20} color="white" style={styles.icon} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="home" size={24} color="gray" />
          <Text style={styles.navText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="user" size={24} color="gray" />
          <Text style={styles.navText}>Bản thân</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="cog" size={24} color="#2F54EB" />
          <Text style={[styles.navText, { color: '#2F54EB' }]}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 20 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  logoContainer: { alignItems: 'center', marginVertical: 20 },
  logo: { width: 150, height: 150 },
  optionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 15, backgroundColor: '#F6F6F6', marginBottom: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 10 },
  optionText: { fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 15 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D32F2F', padding: 15, borderRadius: 15 },
  logoutText: { fontSize: 16, color: 'white' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: 'gray' },
});

export default SettingsScreen;