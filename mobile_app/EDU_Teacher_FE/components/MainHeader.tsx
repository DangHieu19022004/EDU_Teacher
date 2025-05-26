// components/MainHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useUser } from '../app/contexts/UserContext';

interface MainHeaderProps {
  title: string;
}

const MainHeader: React.FC<MainHeaderProps> = ({ title }) => {
  const { user } = useUser();

  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/images/Logo-TLU.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.headerTitle}>{title}</Text>

      <TouchableOpacity>
        <Image
          source={
            user?.photoURL
              ? { uri: user.photoURL }
              : require('../assets/images/user.png')
          }
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0066CC',
    padding: 15,
    paddingTop: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  logo: {
    width: 45,
    height: 40,
  },
  avatar: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#32ADE6',
  },
});

export default MainHeader;
