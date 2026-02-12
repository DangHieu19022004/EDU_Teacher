import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Menu: React.FC = () => {
  return (
    <LinearGradient colors={['#3BA3F2', '#1A47C0']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Tìm kiếm"
            style={styles.input}
            placeholderTextColor="#888"
            editable={true} // Đảm bảo có thể nhập liệu
          />
          <TouchableOpacity style={styles.searchIcon}>
            <FontAwesome name="search" size={18} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
  },
  searchIcon: {
    padding: 10,
  },
});

export default Menu;
