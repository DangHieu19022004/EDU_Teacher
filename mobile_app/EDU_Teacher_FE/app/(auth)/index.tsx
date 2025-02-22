import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoginScreen from './login';

const AuthScreen = () => {
    return (
        <View style={styles.container}>
            <LoginScreen />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default AuthScreen;
