import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MainLayout() {

    return (
        <Tabs
            screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#999999',
            tabBarStyle: {
                height: 60,
                paddingTop: 8,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                backgroundColor:  '#ffffff',
            },
            headerTintColor: '#000000',
            }}
        >
            <Tabs.Screen
            name="home"
            options={{
                title: 'Trang chủ',
                tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                headerShown: false,
            }}
            />
            <Tabs.Screen
            name="teacherinfo"
            options={{
                title: 'Bản thân',
                tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                headerShown: false,
            }}
            />
            <Tabs.Screen
            name="setting"
            options={{
                title: 'Cài đặt',
                tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
                headerShown: false,
            }}
            />

        </Tabs>
    );
}
